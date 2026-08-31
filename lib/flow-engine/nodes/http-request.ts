import type { FlowExecutionContext, HttpRequestNodeData } from "../types";
import { interpolateVariables } from "../utils";

export async function executeHttpRequest(
  data: HttpRequestNodeData,
  context: FlowExecutionContext
) {
  try {
    const url = interpolateVariables(data.url, context.variables || {});
    const body = data.body
      ? interpolateVariables(data.body, context.variables || {})
      : undefined;

    const response = await fetch(url, {
      method: data.method,
      headers: {
        "Content-Type": "application/json",
        ...data.headers,
      },
      body: data.method !== "GET" ? body : undefined,
    });

    const responseData = await response.text();

    // Store response in variable if configured
    if (data.responseVariable && context.variables) {
      try {
        context.variables[data.responseVariable] = JSON.parse(responseData);
      } catch {
        context.variables[data.responseVariable] = responseData;
      }
    }
  } catch (error) {
    console.error("HTTP request failed:", error);
  }
}
