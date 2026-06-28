export function uploadImage(request, response) {
    response.status(201).json({
        url: `${request.protocol}://${request.get("host")}/uploads/${request.file.filename}`,
    });
}
