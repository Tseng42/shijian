import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 品牌色系的文字型佔位 OG 圖，待正式攝影素材到位後可替換為照片版本。
// 底色/文字色沿用全站唯一的色彩 token（tailwind.config.ts 的 ink/stone），避免各處各自硬編出微妙不同的色號。
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0F1620",
          color: "#F0F3F2",
        }}
      >
        <div style={{ display: "flex", fontSize: 108, fontWeight: 700 }}>
          拾間
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 40,
            letterSpacing: 10,
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          ShiJian
        </div>
      </div>
    ),
    { ...size }
  );
}
