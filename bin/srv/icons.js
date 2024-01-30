const fs = require('fs');

let outn = [];

let run = async () => {
    const dirs = await fs.readdirSync('./bin/img/icons');

    dirs.forEach(async (dir) => {
        if (dir.includes('DS_Store')) return;

        const icons = fs.readdirSync(`./bin/img/icons/${dir}`);
    
        icons.forEach(async (icon) => {
            let hbs_url = `icons/${dir}/${icon.replace('.svg', '')}`;
    
            let arr = icon.split();
            let name = arr[0].replace('.svg', '');
    
            let type = dir.toUpperCase();

            let data = await fs.readFileSync(`./bin/img/icons/${dir}/${icon}`);
    
            outn.push({
                hbs_url: hbs_url,
                name: name,
                type: type,
                data: data.toString().replace('width="{{width}}px"', 'width="{{width}}px" class="svg-color-primary"').replace('{{width}}', '164').replace('{{height}}', '164')
            });
        });
    });
}

function capitalizeTxt(txt) {
    return txt.charAt(0).toUpperCase() + txt.slice(1); //or if you want lowercase the rest txt.slice(1).toLowerCase();
  }

run().then(async () => {
    let final = '';

    outn.forEach((item) => {

        let b = `<div class="prod-card radius-md" style="width: fit-content; height: fit-content; background-color: var(--color-bg);">
        <span class="prod-card__badge" role="text">${item.type}</span>
    
        <a class="prod-card__img-link" href="#0" aria-label="Description of the link">
        <figure class="prod-card__img text-center">
            ${item.data}
        </figure>
        </a>
    
        <div class="padding-sm text-center">
        <h3><a class="color-inherit" href="#0">${capitalizeTxt(item.name)}</a></h3>
    
        <div class="margin-top-xs">
            <span class="prod-card__price">> ${item.hbs_url} width=164 height=164 color=svg-color-primary</span>
        </div>
        </div>
    </div>`

    final += b;
    });

    fs.writeFile('./icons.txt', final, 'utf8', (err) => {
        return err;
    });
});