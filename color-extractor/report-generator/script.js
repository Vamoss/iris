document.addEventListener('DOMContentLoaded', function () {
    const images = [
        'IMG_1644',
        'IMG_1645',
        'IMG_1646',
        'IMG_1647',
        'IMG_8034',
        'IMG_8041',
        'IMG_8045',
        'IMG_8046',
        'IMG_8053',
        'IMG_8057',
        'IMG_8058',
        'IMG_8059',
        'IMG_8245',
        'IMG_8247_A',
        'IMG_8247_B',
        'IMG_8248',
        'IMG_8249',
        'IMG_8251',
        'IMG_8281',
        'IMG_8289',
        'IMG_8316',
        'IMG_8319',
        'IMG_8322',
        'IMG_8323',
        'IMG_8324',
        'IMG_8325',
        'IMG_8328',
        'IMG_8330',
        'IMG_8335',
        'IMG_8337',
        'IMG_8338',
        'IMG_8339',
        'IMG_8342',
        'IMG_8343',
        'IMG_8344',
        'IMG_8347',
        'IMG_8348',
        'IMG_8349',
        'IMG_8350',
        'IMG_8353',
        'IMG_8354',
        'IMG_8356',
        'IMG_8359',
        'IMG_8489',
        'IMG_8491',
        'IMG_8493',
        'IMG_8494',
        'IMG_8495',
        'IMG_8496',
        'IMG_8497',
        'IMG_8501',
        'IMG_8504',
        'IMG_8505',
        'IMG_8506',
        'IMG_8507',
        'IMG_8509',
        'IMG_8519',
        'IMG_8525',
        'IMG_8526',
        'IMG_8527',
        'IMG_8530',
        'IMG_8532',
        'IMG_8534',
        'IMG_8595',
        'IMG_8657',
        'IMG_9011',
        'IMG_9015',
        'IMG_9117'
    ];

    const container = document.getElementById('image-container');

    images.forEach(src => {
        const imageSrc = '../images/' + src + '.jpg';
        const jsonSrc = '../google-vision/' + src + '.json';

        const img = new Image();
        img.src = imageSrc;
        img.crossOrigin = 'Anonymous';
        img.onload = () => {

            // Adicionar os elementos ao container
            const imgContainer = document.createElement('div');
            imgContainer.className = 'img-container';

            const h1 = document.createElement('h1');
            h1.textContent = src;
            imgContainer.appendChild(h1);

            // Criar um elemento para exibir a imagem
            const imgPreview = document.createElement('div');
            imgPreview.className = 'img-preview';
            imgPreview.appendChild(img);
            imgContainer.appendChild(imgPreview);

            
            colorjs.prominent(imageSrc, { amount: 11, sample: 2 }).then(colors => {

                colors.shift();//remove a cor transparent

                const h3 = document.createElement('h3');
                h3.textContent = 'Color.js';
                imgContainer.appendChild(h3);

                const colorPreview = document.createElement('div');
                colorPreview.className = 'color-preview';
                colors.forEach(color => {
                    console.log(color)
                    const colorDiv = document.createElement('div');
                    colorDiv.className = 'color-block';
                    colorDiv.style.backgroundColor = 'rgb(' + color.join(",") + ')';
                    colorPreview.appendChild(colorDiv);
                });
                imgContainer.appendChild(colorPreview);

                // Exibir o JSON com as cores extraídas
                const jsonPreview = document.createElement('pre');
                jsonPreview.className = 'json-preview';
                jsonPreview.textContent = JSON.stringify(colors);
                imgContainer.appendChild(jsonPreview);
            })
            
            fetch(jsonSrc)
                .then(response => response.json())
                .then(data => {
                    const colors = data.map(d => [d.color.red, d.color.green, d.color.blue]);

                    const h3 = document.createElement('h3');
                    h3.textContent = 'Google Vision';
                    imgContainer.appendChild(h3);

                    const colorPreview = document.createElement('div');
                    colorPreview.className = 'color-preview';
                    colors.forEach(color => {
                        const colorDiv = document.createElement('div');
                        colorDiv.className = 'color-block';
                        colorDiv.style.backgroundColor = 'rgb(' + color.join(",") + ')';
                        colorPreview.appendChild(colorDiv);
                    });
                    imgContainer.appendChild(colorPreview);
    
                    // Exibir o JSON com as cores extraídas
                    const jsonPreview = document.createElement('pre');
                    jsonPreview.className = 'json-preview';
                    jsonPreview.textContent = JSON.stringify(colors);
                    imgContainer.appendChild(jsonPreview);
                })
                .catch(error => console.log(error));

            container.appendChild(imgContainer);
        };
    });
});
