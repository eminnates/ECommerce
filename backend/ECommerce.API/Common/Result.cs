namespace ECommerce.API.Common;

public enum ErrorKind
{
    Validation,
    NotFound,
    Conflict
}

public record Error(ErrorKind Kind, string Message);

/// <summary>
/// Servis katmanının HTTP'den habersiz kalmasını sağlar; status code eşlemesi controller'da yapılır.
/// </summary>
public readonly record struct Result<T>(T? Value, Error? Error)
{
    public bool IsSuccess => Error is null;

    public static Result<T> Ok(T value) => new(value, null);

    public static Result<T> Fail(ErrorKind kind, string message) => new(default, new Error(kind, message));
}
