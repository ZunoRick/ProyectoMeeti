let file;

document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.querySelector('.drop-area');
    const dragText = document.querySelector('.drop-area h3');
    const button = document.querySelector('.drop-area button');
    const input = document.querySelector('.drop-area #input-file');

    if (dropArea) {
        button.addEventListener('click', e =>{
            e.preventDefault();
            input.click();
        });
    
        input.addEventListener('change', e =>{
            file = input.files;
            dropArea.classList.add("active");
            showFile(file);
            dropArea.classList.remove('active');
        });

        dropArea.addEventListener('dragover', e=>{
            e.preventDefault();
            dropArea.classList.add('active');
            dragText.textContent = "Suelta para subir el archivo"
        });
        
        //Cuando se arrastra pero no es dentro del área
        dropArea.addEventListener('dragleave', e=>{
            e.preventDefault();
            dropArea.classList.remove('active');
            dragText.textContent = "Arrastra y suelta tu imagen"
        });
        
        //Cuando se sueltan los archivos dentro del área
        dropArea.addEventListener('drop', e=>{
            e.preventDefault();
            input.files = e.dataTransfer.files;
            file = input.files;
            showFile(file);
            dropArea.classList.remove('active');
            dragText.textContent = "Arrastra y suelta tu imagen"
        });
    }
    
});

function showFile(file){
    if(file.length === 1){
        const fileUrl = (URL.createObjectURL(file[0]));
        // console.log(fileUrl);

        const imagenActual = document.querySelector('.campo img');
        imagenActual.removeAttribute('hidden');
        imagenActual.src = fileUrl;
    }
}