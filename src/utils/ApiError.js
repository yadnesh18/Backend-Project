class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack=""
    )
    
    {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.message = message;
        this.stack = stack;
       
}
}   


export default ApiError;