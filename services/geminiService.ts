import { UserProfile } from "../types";

const getAdviceApiUrl = () => {
  return import.meta.env.VITE_AI_API_URL || "/api/financial-advice";
};

export const getFinancialAdvice = async (
  userContext: UserProfile,
  userQuery: string
): Promise<string> => {
  const response = await fetch(getAdviceApiUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userContext,
      userQuery,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "No se pudo obtener respuesta de la IA.");
  }

  return data.text || "Lo siento, no pude generar un consejo en este momento.";
};
