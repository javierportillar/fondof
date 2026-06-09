import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {defineSecret} from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import type {Response} from "express";

setGlobalOptions({maxInstances: 10});

const geminiApiKey = defineSecret("GEMINI_API_KEY");

type LoanContext = {
  amount?: number;
  remainingAmount?: number;
  interestRate?: number;
  monthlyPayment?: number;
  status?: string;
  nextPaymentDate?: string;
};

type SavingsContext = {
  balance?: number;
  monthlyContribution?: number;
};

type AdviceRequestBody = {
  userContext?: {
    name?: string;
    creditLimit?: number;
    savings?: SavingsContext;
    loans?: LoanContext[];
  };
  userQuery?: string;
};

const setCors = (res: Response) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
};

const buildPrompt = (body: AdviceRequestBody) => {
  const userContext = body.userContext ?? {};
  const loans = Array.isArray(userContext.loans) ? userContext.loans : [];
  const totalDebt = loans.reduce(
    (acc, loan) => acc + Number(loan.remainingAmount ?? 0),
    0,
  );
  const creditLimit = Number(
    userContext.creditLimit ?? 0,
  ).toLocaleString("es-CO");
  const savingsBalance = Number(
    userContext.savings?.balance ?? 0,
  ).toLocaleString("es-CO");
  const monthlyContribution = Number(
    userContext.savings?.monthlyContribution ?? 0,
  ).toLocaleString("es-CO");
  const loanSummary = loans.length > 0 ?
    loans.map((loan, index) => {
      const amount = Number(loan.amount ?? 0).toLocaleString("es-CO");
      const remaining = Number(
        loan.remainingAmount ?? 0,
      ).toLocaleString("es-CO");
      const monthlyPayment = Number(
        loan.monthlyPayment ?? 0,
      ).toLocaleString("es-CO");

      return [
        `${index + 1}. Monto: $${amount}`,
        `   Saldo: $${remaining}`,
        `   Tasa: ${Number(loan.interestRate ?? 0)}%`,
        `   Cuota: $${monthlyPayment}`,
        `   Estado: ${loan.status ?? "N/D"}`,
        `   Proximo pago: ${loan.nextPaymentDate ?? "N/D"}`,
      ].join("\n");
    }).join("\n") :
    "- Sin prestamos registrados";

  return `
Actua como un asesor financiero experto y prudente para "Fondo Fortuna",
una cooperativa de empleados.

Contexto del usuario:
- Nombre: ${userContext.name ?? "Usuario"}
- Cupo de credito: $${creditLimit}
- Ahorro total: $${savingsBalance}
- Aporte mensual de ahorro: $${monthlyContribution}
- Deuda activa total: $${totalDebt.toLocaleString("es-CO")}
- Prestamos activos: ${loans.length}

Detalle de prestamos:
${loanSummary}

Instrucciones:
1. Responde en espanol.
2. Se conciso y practico.
3. Usa markdown para resaltar montos y conclusiones.
4. Si detectas endeudamiento alto, prioriza ahorro, control de gasto
   y pago de deuda.
5. Si faltan datos para una conclusion fuerte, dilo explicitamente.
6. No inventes politicas internas ni aprobaciones de credito.

Pregunta del usuario:
${body.userQuery ?? ""}
`.trim();
};

export const api = onRequest({secrets: [geminiApiKey]}, async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({error: "Method not allowed"});
    return;
  }

  const body = (req.body ?? {}) as AdviceRequestBody;
  const userQuery = body.userQuery?.trim();

  if (!userQuery) {
    res.status(400).json({error: "userQuery is required"});
    return;
  }

  const apiKey = geminiApiKey.value();
  if (!apiKey) {
    logger.error("Missing GEMINI_API_KEY secret");
    res.status(500).json({error: "AI service is not configured"});
    return;
  }

  try {
    const prompt = buildPrompt(body);
    const response = await fetch(
      [
        "https://generativelanguage.googleapis.com/v1beta/models/",
        "gemini-2.5-flash:generateContent",
      ].join(""),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{text: prompt}],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Gemini request failed", {
        status: response.status,
        body: errorText,
      });
      res.status(502).json({error: "AI provider request failed"});
      return;
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{text?: string}>;
        };
      }>;
    };
    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      res.status(502).json({error: "Empty AI response"});
      return;
    }

    res.json({text});
  } catch (error) {
    logger.error("financial-advice error", error);
    res.status(500).json({error: "Internal server error"});
  }
});
