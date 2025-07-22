import { ImageResponse } from "next/og"

async function getUserData(username: string) {
  try {
    const response = await fetch(
      `https://supaclicker.vercel.app/${username}/debug-og/`,
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
      return new ImageResponse(
        <div
          style={{
            fontSize: 48,
            background: "#f5f5f5",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontFamily: "monospace",
            border: "4px solid #000",
          }}
        >
          USER NOT FOUND
        </div>,
        { ...size },
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

    // Couleurs basées sur votre CSS
    const bgColor = "#f5f5f5" // --background light
    const cardBg = "#ffffff" // --card light
    const borderColor = "#000000" // Bordures noires comme dans votre style
    const textColor = "#000000" // --foreground light
    const primaryColor = stats.prestige_level > 0 ? "#a855f7" : "#10b981" // Purple si prestige, sinon vert
    const primaryBg = stats.prestige_level > 0 ? "#f3e8ff" : "#d1fae5"

    return new ImageResponse(
      <div
        style={{
          background: bgColor,
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "40px",
          fontFamily: "monospace",
        }}
      >
        {/* Container principal avec bordure noire */}
        <div
          style={{
            background: cardBg,
            border: `4px solid ${borderColor}`,
            boxShadow: "8px 8px 0 #000",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "40px",
            position: "relative",
          }}
        >
          {/* Header avec nom et prestige */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "30px",
            }}
          >
            {/* Nom utilisateur */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: textColor,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  display: "flex",
                }}
              >
                {displayName}
              </div>
              {profile.display_name && profile.display_name !== profile.username && (
                <div
                  style={{
                    fontSize: "24px",
                    color: "#666",
                    display: "flex",
                  }}
                >
                  @{profile.username}
                </div>
              )}
            </div>

            {/* Badge Prestige */}
            {stats.prestige_level > 0 && (
              <div
                style={{
                  background: primaryBg,
                  border: `3px solid ${primaryColor}`,
                  boxShadow: `4px 4px 0 ${primaryColor}`,
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div style={{ fontSize: "28px", display: "flex" }}>👑</div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: primaryColor,
                    textTransform: "uppercase",
                    display: "flex",
                  }}
                >
                  PRESTIGE {stats.prestige_level}
                </div>
              </div>
            )}
          </div>

          {/* Bio si présente */}
          {profile.bio && (
            <div
              style={{
                background: "#f9f9f9",
                border: `2px solid ${borderColor}`,
                padding: "20px",
                marginBottom: "30px",
                fontSize: "18px",
                color: "#333",
                display: "flex",
              }}
            >
              {profile.bio}
            </div>
          )}

          {/* Stats Grid */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "auto",
            }}
          >
            {/* Total Power - Stat principale */}
            <div
              style={{
                background: primaryBg,
                border: `3px solid ${primaryColor}`,
                boxShadow: `4px 4px 0 ${primaryColor}`,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 2,
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  color: primaryColor,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                  display: "flex",
                }}
              >
                ⚡ TOTAL POWER
              </div>
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: "bold",
                  color: primaryColor,
                  display: "flex",
                }}
              >
                {formatNumber(stats.total_power)}
              </div>
            </div>

            {/* Autres stats */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                flex: 1,
              }}
            >
              <div
                style={{
                  background: "#f0f0f0",
                  border: `2px solid ${borderColor}`,
                  boxShadow: `3px 3px 0 ${borderColor}`,
                  padding: "15px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                    display: "flex",
                  }}
                >
                  POWER/SEC
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: textColor,
                    display: "flex",
                  }}
                >
                  {formatNumber(stats.clicks_per_second)}
                </div>
              </div>

              <div
                style={{
                  background: "#f0f0f0",
                  border: `2px solid ${borderColor}`,
                  boxShadow: `3px 3px 0 ${borderColor}`,
                  padding: "15px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                    display: "flex",
                  }}
                >
                  🏆 ACHIEVEMENTS
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: textColor,
                    display: "flex",
                  }}
                >
                  {stats.achievements_count}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      { ...size },
    )
  } catch (error) {
    console.error("Error generating OG image:", error)

    return new ImageResponse(
      <div
        style={{
          fontSize: 40,
          background: "#ff6b6b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "monospace",
          border: "4px solid #000",
        }}
      >
        ERROR: {error instanceof Error ? error.message : "Unknown error"}
      </div>,
      { ...size },
    )
  }
}