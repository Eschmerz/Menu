const cloudName = 'eschmerz';
const uploadPreset = 'Navadez';

const uploadImage = (file) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    return fetch(url, {
    method: 'POST',
    body: formData
    })
    .then(response => response.json())
    .then(data => data.secure_url);
};
