import { ImageResponse } from "next/og"

async function getUserData(username: string) {
  try {
    const response = await fetch(
      `${process.env.VERCEL_URL || "https://supaclicker.vercel.app"}/api/debug-og/${username}`,
      {
        headers: {
          "User-Agent": "OpenGraph-Image-Generator",
        },
      },
    )

    if (!response.ok) {
      console.error("Failed to fetch user data:", response.status)
      return null
    }

    const result = await response.json()

    if (!result.hasData || !result.data) {
      console.error("No user data found")
      return null
    }

    return {
      profile: result.data.profile,
      stats: result.data.stats,
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params
    console.log("Generating OG image for:", username)

    const result = await getUserData(username)

    if (!result) {
      console.log("No user found, generating error image")
      return new ImageResponse(
        <div
          style={{
            fontSize: 60,
            background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "monospace",
          }}
        >
          USER NOT FOUND
        </div>,
        {
          ...size,
        },
      )
    }

    const { profile, stats } = result
    const displayName = profile.display_name || profile.username

    const formatNumber = (num: number) => {
      if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`
      if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
      if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
      if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
      return num.toLocaleString()
    }

    console.log("Generating image for:", displayName, "Power:", stats.total_power, "Prestige:", stats.prestige_level)

    return new ImageResponse(
      <div
        style={{
          background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            background: "#f3f4f6",
            border: "4px solid #1f2937",
            padding: "60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            width: "90%",
            height: "80%",
            position: "relative",
          }}
        >
          {/* Prestige Badge */}
          {stats.prestige_level > 0 && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "#fbbf24",
                border: "3px solid #d97706",
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "24px" }}>👑</span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#92400e",
                }}
              >
                PRESTIGE {stats.prestige_level}
              </span>
            </div>
          )}

          {/* Avatar */}
          <div
            style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "48px",
              fontWeight: "bold",
              marginBottom: "30px",
              border: "3px solid #1f2937",
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          {/* Nom */}
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            {displayName}
          </div>

          {profile.display_name && profile.display_name !== profile.username && (
            <div
              style={{
                fontSize: "24px",
                color: "#6b7280",
                marginBottom: "30px",
              }}
            >
              @{profile.username}
            </div>
          )}

          {/* Power */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              background: "#fef3c7",
              border: "3px solid #f59e0b",
              padding: "20px 40px",
              marginTop: "20px",
            }}
          >
            <span style={{ fontSize: "36px" }}>⚡</span>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontSize: "16px",
                  color: "#92400e",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                TOTAL POWER
              </div>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "#92400e",
                }}
              >
                {formatNumber(stats.total_power)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "16px",
              color: "#6b7280",
              textTransform: "uppercase",
            }}
          >
            SUPA CLICKER PROFILE
          </div>
        </div>
      </div>,
      {
        ...size,
      },
    )
  } catch (error) {
    console.error("Error generating OG image:", error)

    return new ImageResponse(
      <div
        style={{
          fontSize: 40,
          background: "#dc2626",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "monospace",
        }}
      >
        ERROR: {error instanceof Error ? error.message : "Unknown error"}
      </div>,
      {
        ...size,
      },
    )
  }
}
