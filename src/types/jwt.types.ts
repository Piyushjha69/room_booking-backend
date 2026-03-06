export interface TokenPayload {
    userId: string
    email: string
    role: string
}

export interface JwtTokens {
    accessToken: string
    refreshToken: string
}