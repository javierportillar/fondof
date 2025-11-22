import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

const getClient = () => {
  // Ensure API key is present
  // const apiKey = process.env.API_KEY;
  const apiKey = "AIzaSyBUb87rqrnfDKsHXmYJ1yPb0nRREL6CCak";

  if (!apiKey) {
    console.error("API Key missing");
    throw new Error("API Key is required");
  }
  return new GoogleGenAI({ apiKey });
};

export const getFinancialAdvice = async (
  userContext: UserProfile,
  userQuery: string
): Promise<string> => {
  try {
    const ai = getClient();
    const model = ai.models;

    const systemPrompt = `
      Actúa como un asesor financiero experto y empático para 'Fondo Fortuna', una cooperativa de empleados.
      
      Contexto del Usuario:
      - Nombre: ${userContext.name}
      - Ahorro Total: $${userContext.savings.balance}
      - Deuda Activa: $${userContext.loans.reduce((acc, loan) => acc + loan.remainingAmount, 0)}
      - Préstamos Activos: ${userContext.loans.length}
      
      Reglas:
      1. Sé conciso y práctico.
      2. Usa formato markdown para resaltar números importantes.
      3. Si el usuario pregunta por productos, recomienda ahorrar antes de gastar si tienen mucha deuda.
      4. El tono debe ser alentador pero responsable financieramente.
    `;

    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `System Instruction: ${systemPrompt}\n\nUser Query: ${userQuery}` }] }
      ],
    });

    return response.text || "Lo siento, no pude generar un consejo en este momento.";
  } catch (error) {
    console.error("Error getting financial advice:", error);
    return "Hubo un error conectando con el asesor inteligente. Por favor intenta más tarde.";
  }
};