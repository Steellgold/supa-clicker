import { ImageResponse } from "next/og"

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 60,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui",
      }}
    >
      Test OG Image
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
