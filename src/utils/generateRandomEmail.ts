export function generateRandomEmail(): string {
    const base = "globals1"; 
    const timestamp = Date.now(); 
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${base}-${timestamp}-${randomString}`;
}
