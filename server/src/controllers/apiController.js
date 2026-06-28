export function getApiInfo(_request, response) {
    response.status(200).json({
        name: "VK Quiz API",
        version: "1.0.0",
        status: "ready",
    });
}
