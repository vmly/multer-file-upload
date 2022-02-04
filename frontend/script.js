const form = document.getElementById("form");

const submitForm = async (e) => {
    e.preventDefault();
    const name = document.getElementById("name");
    const files = document.getElementById("files");

    const formData = new FormData();

    formData.append("name", name.value);

    for (let i = 0; i < files.files.length; i++) {
        try {
            let x = await splitEncode(files.files[i]);
			let filename = files.files[i].name
            console.log(x);
            let blob = new Blob([JSON.stringify(x)], {type : "application/json"})
            formData.append("files", blob, filename);
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    fetch("http://localhost:5000/upload_files", {
        method: "post",
        body: formData,
    })
        .then((res) => console.log(res))
        .catch((err) => ("Error occured", err));
};

function blobToBase64(blob) {
    var reader = new FileReader();

    reader.readAsDataURL(blob);
    reader.onloadend = function () {
        var base64data = reader.result;
        console.log(base64data);
        return;
    };
}

const splitEncode = async (file) => {
    const chunkSize = 60000; // 50KB
    const filename = file.name;
    console.log("FILE - ", filename);
    const numberOfChunks = Math.ceil(file.size / chunkSize);
    let start = 0,
        end = 0;
    let chunk, base64String;
    let x = [];
    for (let index = 0; index < numberOfChunks; index++) {
        start = index * chunkSize;
        end = Math.min(start + chunkSize, file.size);

        chunk = file.slice(start, end);
        console.log("CHUNKS - ", start, end);

        function blobToBase64(blob) {
            return new Promise((resolve, _) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        }

        x.push(blobToBase64(chunk));
    }
    try {
        const base64Arr = await Promise.all(x).then((data) => data);
        return base64Arr;
    } catch (error) {
        console.log(err);
    }
};

form.addEventListener("submit", submitForm);
// FILE -> 1MB
// Create chunks 50KB (200 chunks)
// CHUNK -> BASE64ENCODE -> PUSH TO ARR
// obj = {ARR: ARR, FILENAME: FILE.NAME, NUM_CHUNKS: 200}
// FormData.append(filename, blob(obj))
