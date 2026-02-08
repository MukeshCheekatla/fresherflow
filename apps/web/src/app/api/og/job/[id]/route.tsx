import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

type OpportunityDto = {
  id: string;
  title: string;
  company: string;
  type?: "JOB" | "INTERNSHIP" | "WALKIN";
  locations?: string[];
  companyWebsite?: string | null;
  applyLink?: string | null;
};

const getApiBase = () =>
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.fresherflow.in";

const sanitizeDomain = (raw: string) => {
  try {
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
    const parts = host.split(".").filter(Boolean);
    if (parts.length >= 2) {
      return parts.slice(-2).join(".");
    }
    return host;
  } catch {
    return "";
  }
};

const inferDomain = (opportunity: OpportunityDto) => {
  const fromWebsite = sanitizeDomain(opportunity.companyWebsite || "");
  if (fromWebsite) return fromWebsite;

  const fromApply = sanitizeDomain(opportunity.applyLink || "");
  if (fromApply) return fromApply;

  const fromCompany = opportunity.company
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "");
  return fromCompany ? `${fromCompany}.com` : "";
};

const getLogoUrl = (opportunity: OpportunityDto) => {
  const domain = inferDomain(opportunity);
  if (!domain) return "";
  return `https://logo.clearbit.com/${domain}?size=200`;
};

const getTypeLabel = (type?: string) => {
  if (type === "INTERNSHIP") return "INTERNSHIP";
  if (type === "WALKIN") return "WALK-IN";
  return "JOB";
};

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiBase = getApiBase();

  let opportunity: OpportunityDto | null = null;

  try {
    const response = await fetch(
      `${apiBase}/api/opportunities/${encodeURIComponent(id)}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return new Response("Opportunity not found", { status: 404 });
    }

    const payload = await response.json();
    opportunity = payload?.opportunity || null;
  } catch {
    return new Response("Failed to generate image", { status: 500 });
  }

  if (!opportunity) {
    return new Response("Opportunity not found", { status: 404 });
  }

  const logoUrl = getLogoUrl(opportunity);
  const title = truncate(opportunity.title || "Opportunity", 88);
  const company = truncate(opportunity.company || "Company", 42);
  const location = truncate(opportunity.locations?.[0] || "India", 28);
  const typeLabel = getTypeLabel(opportunity.type);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background:
            "linear-gradient(135deg, #07142d 0%, #0e274f 40%, #153872 100%)",
          color: "#f8fafc",
          padding: "48px",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "rgba(15, 23, 42, 0.45)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              borderRadius: "18px",
              padding: "14px 20px",
            }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Company logo"
                width={56}
                height={56}
                style={{
                  borderRadius: "12px",
                  background: "#ffffff",
                  objectFit: "contain",
                  padding: "6px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#1e293b",
                  color: "#e2e8f0",
                  fontWeight: 700,
                }}
              >
                {company.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "20px",
                  color: "#cbd5e1",
                  letterSpacing: "0.03em",
                }}
              >
                Hiring at
              </span>
              <span style={{ fontSize: "34px", fontWeight: 700 }}>{company}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              borderRadius: "999px",
              background: "rgba(2, 6, 23, 0.5)",
              border: "1px solid rgba(148, 163, 184, 0.28)",
              padding: "10px 18px",
            }}
          >
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "999px",
                background: "#f8fafc",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "15px",
              }}
            >
              F
            </span>
            <span style={{ fontSize: "24px", fontWeight: 700 }}>FresherFlow</span>
          </div>
        </div>

        <div
          style={{
            marginTop: "58px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span
              style={{
                borderRadius: "999px",
                border: "1px solid rgba(186, 230, 253, 0.45)",
                background: "rgba(14, 116, 144, 0.24)",
                color: "#e0f2fe",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                padding: "10px 18px",
              }}
            >
              {typeLabel}
            </span>
            <span
              style={{
                borderRadius: "999px",
                border: "1px solid rgba(186, 230, 253, 0.25)",
                background: "rgba(15, 23, 42, 0.35)",
                color: "#e2e8f0",
                fontSize: "22px",
                fontWeight: 600,
                padding: "10px 18px",
              }}
            >
              {location}
            </span>
          </div>

          <div
            style={{
              fontSize: "62px",
              lineHeight: 1.1,
              fontWeight: 800,
              maxWidth: "1100px",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            color: "#bfdbfe",
            fontSize: "24px",
            letterSpacing: "0.02em",
          }}
        >
          Verified listing on fresherflow.in
        </div>
      </div>
    ),
    size
  );
}
