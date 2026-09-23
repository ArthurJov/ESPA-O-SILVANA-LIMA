/**
 * ESPAÇO SILVANA LIMA — Site Content Data
 * All dynamic data, phone numbers, and addresses centralized here.
 */

export const siteData = {
  brandName: "Espaço Silvana Lima",
  slogan: "Onde mulheres voltam a morar bem em si mesmas.",
  since: 2016,
  segment: "Estética e bem-estar",
  positioning: "Foco em harmonização abdominal, diástase e redução abdominal.",
  siteUrl: "https://espacosilvanalima.com.br", // Domínio sujeito a confirmação.

  // Contact
  whatsappNumber: "5571985189148", // International format for API
  whatsappDisplay: "(71) 98518-9148",
  instagram: "@espacosilvanalima",
  instagramUrl: "https://www.instagram.com/espacosilvanalima/",
  
  // Location
  address: {
    line1: "Shop Prime Center",
    line2: "Rua Francisco das Mercês, 43",
    line3: "2º andar, sala 210",
    district: "Buraquinho",
    city: "Lauro de Freitas",
    state: "BA",
    zip: "42709-290"
  },

  // Dados sujeitos a confirmação antes da publicação.
  hours: [
    { day: "Segunda-feira", time: "14h às 20h" },
    { day: "Terça a quinta-feira", time: "8h às 12h e 14h às 20h" },
    { day: "Sexta-feira", time: "8h às 12h e 13h às 19h" },
    { day: "Sábado e domingo", time: "Fechado" }
  ],

  // Dados sujeitos a confirmação antes da publicação.
  socialProof: {
    googleRating: null,
    googleReviews: null,
    instagramFollowers: null
  },

  features: {
    mentoriaEnabled: true,
    dataNeedsConfirmation: true,
    pendingConfirmation: [
      "horários",
      "sala",
      "métricas sociais",
      "procedimentos publicados",
      "credenciais",
      "mentoria",
      "domínio",
      "fotografias oficiais"
    ]
  },

  // Um registro só pode aparecer na página pública quando os três flags forem true.
  results: [
    {
      id: "resultado-abdominal-01",
      procedure: "Evolução abdominal",
      region: "Vista lateral",
      compositeImage: "/images/Antes e Depois/Captura de tela 2026-09-23 114210.png",
      imageWidth: 314,
      imageHeight: 177,
      imageAlt: "Montagem oficial de antes e depois do abdômen em vista lateral",
      context: "",
      authorized: true,
      confirmed: true,
      published: true
    },
    {
      id: "resultado-abdominal-02",
      procedure: "Evolução abdominal",
      region: "Vista posterior",
      compositeImage: "/images/Antes e Depois/Captura de tela 2026-09-23 114312.png",
      imageWidth: 261,
      imageHeight: 138,
      imageAlt: "Montagem oficial de antes e depois da região abdominal em vista posterior",
      context: "",
      authorized: true,
      confirmed: true,
      published: true
    },
    {
      id: "resultado-abdominal-03",
      procedure: "Evolução abdominal",
      region: "Vista lateral",
      compositeImage: "/images/Antes e Depois/Captura de tela 2026-09-23 114349.png",
      imageWidth: 306,
      imageHeight: 167,
      imageAlt: "Montagem oficial de antes e depois do contorno abdominal em vista lateral",
      context: "",
      authorized: true,
      confirmed: true,
      published: true
    },
    {
      id: "resultado-abdominal-04",
      procedure: "Evolução abdominal",
      region: "Vista lateral",
      compositeImage: "/images/Antes e Depois/Captura de tela 2026-09-23 1144189.png",
      imageWidth: 311,
      imageHeight: 199,
      imageAlt: "Montagem oficial de antes e depois do abdômen em vista lateral",
      context: "",
      authorized: true,
      confirmed: true,
      published: true
    },
    {
      id: "resultado-abdominal-05",
      procedure: "Evolução abdominal",
      region: "Vista frontal",
      compositeImage: "/images/Antes e Depois/Captura de tela 2026-09-23 114524.png",
      imageWidth: 242,
      imageHeight: 121,
      imageAlt: "Montagem oficial de antes e depois do abdômen em vista frontal",
      context: "",
      authorized: true,
      confirmed: true,
      published: true
    },
    {
      id: "resultado-abdominal-06",
      procedure: "Evolução abdominal",
      region: "Vista lateral",
      compositeImage: "/images/Antes e Depois/Captura de tela 2026-09-23 114549.png",
      imageWidth: 233,
      imageHeight: 129,
      imageAlt: "Montagem oficial de antes e depois do abdômen em vista lateral",
      context: "",
      authorized: true,
      confirmed: true,
      published: true
    }
  ]
};
