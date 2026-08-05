// Uygulamadaki tüm HTTP trafiğinin tek geçiş noktası.
// Backend hataları RFC 7807 ProblemDetails formatında döner; burada tek yerde
// çözümlenip kullanıcıya gösterilebilir bir ApiError'a çevrilir.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/** ProblemDetails / ValidationProblemDetails gövdesi. */
interface ProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  /** İstek hiç ulaşamadıysa 0. */
  readonly status: number;
  /** ValidationProblemDetails geldiyse alan bazlı mesajlar. */
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** İptal edilen isteklerin hata olarak gösterilmemesi için ayırt edilir. */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function fallbackMessage(status: number): string {
  if (status === 400) return "Gönderilen bilgiler geçersiz.";
  if (status === 404) return "Kayıt bulunamadı.";
  if (status === 409) return "İşlem mevcut verilerle çakışıyor.";
  if (status >= 500) return "Sunucuda beklenmeyen bir hata oluştu.";
  return "Beklenmeyen bir hata oluştu.";
}

function flattenFieldErrors(errors: Record<string, string[]>): string {
  return Object.values(errors).flat().join(" ");
}

async function toApiError(response: Response): Promise<ApiError> {
  let problem: ProblemDetails | null = null;
  try {
    problem = (await response.json()) as ProblemDetails;
  } catch {
    // Gövde JSON değilse veya boşsa aşağıdaki genel mesaja düşülür.
  }

  if (problem?.errors && Object.keys(problem.errors).length > 0) {
    return new ApiError(flattenFieldErrors(problem.errors), response.status, problem.errors);
  }

  const message = problem?.detail ?? problem?.title ?? fallbackMessage(response.status);
  return new ApiError(message, response.status);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch (error) {
    // AbortError'ı yutmuyoruz; çağıran taraf isAbortError ile ayırt eder.
    if (isAbortError(error)) throw error;
    throw new ApiError("Sunucuya ulaşılamadı. API'nin çalıştığından emin olun.", 0);
  }

  if (!response.ok) throw await toApiError(response);

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: "GET", signal }),

  post: <T>(path: string, body: unknown, signal?: AbortSignal) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }),
};

/** Hata nesnesini her zaman gösterilebilir bir metne çevirir. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Beklenmeyen bir hata oluştu.";
}
