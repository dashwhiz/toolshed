// Domain and DNS lookups shared by the network tools.
// Only endpoints that send Access-Control-Allow-Origin: * — see ROADMAP.md.

const DOH = "https://dns.google/resolve";

// RFC 3492. Browsers dropped the punycode global, and a homograph domain is exactly
// what these tools exist to catch, so decode it here.
export function punydecode(input) {
  const base = 36, tmin = 1, tmax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128;
  let n = initialN, i = 0, bias = initialBias;
  const out = [];
  let basic = input.lastIndexOf("-");
  if (basic < 0) basic = 0;
  for (let j = 0; j < basic; j++) out.push(input.charCodeAt(j));
  for (let idx = basic > 0 ? basic + 1 : 0; idx < input.length; ) {
    const oldi = i;
    for (let w = 1, k = base; ; k += base) {
      if (idx >= input.length) return null;
      const c = input.charCodeAt(idx++);
      let digit;
      if (c >= 48 && c <= 57) digit = c - 22;
      else if (c >= 65 && c <= 90) digit = c - 65;
      else if (c >= 97 && c <= 122) digit = c - 97;
      else return null;
      i += digit * w;
      const t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
      if (digit < t) break;
      w *= base - t;
    }
    const outLen = out.length + 1;
    let delta = oldi === 0 ? Math.floor((i - oldi) / damp) : (i - oldi) >> 1;
    delta += Math.floor(delta / outLen);
    let k = 0;
    for (; delta > ((base - tmin) * tmax) >> 1; k += base) delta = Math.floor(delta / (base - tmin));
    bias = Math.floor(k + ((base - tmin + 1) * delta) / (delta + skew));
    n += Math.floor(i / outLen);
    i %= outLen;
    out.splice(i++, 0, n);
  }
  return String.fromCodePoint(...out);
}

export function toUnicode(host) {
  return host
    .split(".")
    .map((label) => {
      if (!label.startsWith("xn--")) return label;
      const decoded = punydecode(label.slice(4));
      return decoded === null ? label : decoded;
    })
    .join(".");
}

export function parseHost(raw) {
  let value = raw.trim();
  if (!value) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) value = "https://" + value;
  let host;
  try {
    host = new URL(value).hostname;
  } catch {
    return null;
  }
  host = host.replace(/\.$/, "").toLowerCase();
  if (!host.includes(".") || /\s/.test(host)) return null;
  return host;
}

export async function dns(name, type) {
  const res = await fetch(`${DOH}?name=${encodeURIComponent(name)}&type=${type}`, {
    headers: { accept: "application/dns-json" },
  });
  if (!res.ok) throw new Error(`DNS lookup failed (${res.status})`);
  const body = await res.json();
  return {
    nxdomain: body.Status === 3,
    // Type 5 is CNAME; the resolver includes it alongside the answer we asked for.
    records: (body.Answer || []).filter((a) => a.type !== 5).map((a) => a.data),
  };
}

// rdap.org redirects to whichever registry runs the TLD. A 404 usually means the name is
// unregistered, but it also means "wrong label" for www. and co.uk style names, so walk up
// before believing it. Avoids bundling the public suffix list.
export async function rdap(host) {
  const labels = host.split(".");
  for (let i = 0; i < labels.length - 1; i++) {
    const candidate = labels.slice(i).join(".");
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(candidate)}`, {
      headers: { accept: "application/rdap+json" },
    });
    if (res.ok) return { domain: candidate, data: await res.json() };
    if (res.status !== 404) throw new Error(`Registry lookup failed (${res.status})`);
  }
  return null;
}

export function eventDate(data, action) {
  const found = (data.events || []).find((e) => e.eventAction === action);
  return found ? new Date(found.eventDate) : null;
}

export function registrarName(data) {
  const entity = (data.entities || []).find((e) => (e.roles || []).includes("registrar"));
  if (!entity) return null;
  if (entity.vcardArray && Array.isArray(entity.vcardArray[1])) {
    const fn = entity.vcardArray[1].find((f) => f[0] === "fn");
    if (fn) return fn[3];
  }
  return entity.handle || null;
}

export const DAY = 86400000;

export function describeAge(ms) {
  const days = Math.floor(ms / DAY);
  if (days < 1) return "today";
  if (days === 1) return "1 day";
  if (days < 60) return `${days} days`;
  const months = Math.floor(days / 30);
  if (months < 24) return `${months} months`;
  return `${(days / 365).toFixed(1)} years`;
}

export const fmtDate = (d) =>
  d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
