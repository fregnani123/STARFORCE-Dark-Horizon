(function () {
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get('lang') || '';
    const storageLang = localStorage.getItem('sf_language') || '';
    const rawLang = (queryLang || storageLang || 'pt-BR').toLowerCase();
    const activeLang = rawLang.startsWith('pt') ? 'pt-BR' : (rawLang.startsWith('es') ? 'es' : 'en');

    const I18N = {
        'pt-BR': {
            hint: 'ESC para pular - Clique para avançar',
            chapters: {
                c4a: 'CENA 04 - O ÚLTIMO RECURSO',
                c4b: 'CENA 04 - O HANGAR SECRETO',
                c4c: 'CENA 04 - DESCIDA AUTORIZADA'
            },
            speakers: {
                capita: 'CAPITÃ REED',
                fox: 'CYBER FOX',
                player: 'PILOTO',
                narrador: ''
            },
            lines: {
                /* CENA 04-A: Capitã fala*/
                s1_1: 'Não tem como... Enviamos dois esquadrões inteiros de interceptação. Dez das nossas melhores naves. Mas a tecnologia deles... não é deste mundo.',
                s1_2: 'Eles estão nos caçando como se fôssemos moscas. Nossa artilharia nem arranha a fuselagem daquela Nave-Mãe. Estão sendo destruídas uma por uma.',

                /* CENA 04-B: narrador fala (sem foto)*/
                s2_1: 'A Capitã olha para o piloto com desespero contido. Na tela, mais uma nave é perdida contra o inimigo.',

                /* CENA 04-B: capitã fala*/
                s2_2: 'Tem que haver uma brecha. Algum ponto cego, uma fraqueza no escudo daquela coisa.',

                /* CENA 04-C: Ciborgue FoX */
                s3_1: 'Tenho registro de uma instalação secreta de armazenamento de naves. Fica a 36N - 117W, dentro da Área 51. Posso te levar lá, mas é um local altamente restrito. tenho acesso e nao foi destruido, fica no subsolo.',

                /* CENA 04-C: Capitã fala (Chave corrigida de s3_1 para s3_2) */
                s3_2: '\'É suicídio... mas ficar aqui é esperar pelo fim. Autorizado, Piloto. Vá e traga essas naves. Fox, você é o mapa. Não falhem.\'',

                /* CENA 04-B: Player fala (Chave corrigida de s3_2 para s3_3) */
                s3_3: 'Pode deixar. Fox, prepare os motores da nave de descida. Vamos dar o troco.'
            }
        },
        en: {
            hint: 'ESC to skip - Click to advance',
            chapters: {
                c4a: 'SCENE 04 - THE LAST RESORT',
                c4b: 'SCENE 04 - THE SECRET HANGAR',
                c4c: 'SCENE 04 - DESCENT AUTHORIZED'
            },
            speakers: {
                capita: 'CAPTAIN REED',
                fox: 'CYBER FOX',
                player: 'PILOT',
                narrador: ''
            },
            lines: {
                s1_1: 'There\'s no way... We sent two full interception squadrons. Ten of our best ships. But their technology... is not of this world.',
                s1_2: 'They\'re hunting us like flies. Our artillery doesn\'t even scratch the hull of that Mother Ship. They\'re being destroyed one by one.',
                s2_1: 'The Captain looks at the pilot with contained despair. On the screen, another ship is lost to the enemy.',
                s2_2: 'There has to be a gap. Some blind spot, a weakness in that thing\'s shield.',
                s3_1: 'I have records of a secret ship storage facility. It is located at 36N - 117W, inside Area 51. I can take you there.',
                s3_2: '\'It\'s suicide... but staying here is waiting for the end. Authorized, Pilot. Go and bring those ships. Fox, you\'re the map. Don\'t fail.\'',
                s3_3: 'Leave it to me. Fox, prep the descent ship engines. We\'re gonna strike back.'
            }
        },
        es: {
            hint: 'ESC para saltar - Clic para avanzar',
            chapters: {
                c4a: 'ESCENA 04 - EL ÚLTIMO RECURSO',
                c4b: 'ESCENA 04 - EL HANGAR SECRETO',
                c4c: 'ESCENA 04 - DESCENSO AUTORIZADO'
            },
            speakers: {
                capita: 'CAPITANA REED',
                fox: 'CYBER FOX',
                player: 'PILOTO',
                narrador: ''
            },
            lines: {
                s1_1: 'No hay forma... Enviamos dos escuadrones completos de intercepción. Diez de nuestras mejores naves. Pero su tecnologia... no es de este mundo.',
                s1_2: 'Nos cazan como moscas. Nuestra artillería ni araña el fuselaje de esa Nave-Madre. Están siendo destruidas una por una.',
                s2_1: 'La Capitana mira al piloto con desesperación contenida. En la pantalla, otra nave se pierde contra el enemigo.',
                s2_2: 'Tiene que haber una brecha. Algún punto ciego, una debilidad en el escudo de esa cosa.',
                s3_1: 'Tengo registros de una instalación secreta de almacenamiento de naves. Se encuentra en 36N - 117W, dentro del Área 51.',
                s3_2: '\'Es suicidio... pero quedarse aquí es esperar el fin. Autorizado, Piloto. Ve y trae esas naves. Fox, eres el mapa. No fallen.\'',
                s3_3: 'Déjame a mí. Fox, prepara los motores de la nave de descenso. Vamos a devolver el golpe.'
            }
        }
    };

    const tr = I18N[activeLang] || I18N['pt-BR'];

    const CHAR_IMAGES = {
        capita: '../assets/img/cenarios/cenario-missao/inicio-game/capitao.png',
        fox: '../assets/img/cenarios/cenario-missao/inicio-game/piloto-2.png',
        player: '../assets/img/cenarios/cenario-missao/inicio-game/piloto-1.png',
        narrador: null
    };

    const scenes = [
        /* CENA 04-A: Sala de Comando - Base Lunar */
        { img: 'cena-1', chapterKey: 'c4a', year: '2201 A.D.', coord: 'SALA DE COMANDO', textKey: 's1_1', speaker: 'capita' },
        { img: 'cena-1', chapterKey: 'c4a', year: '2201 A.D.', coord: 'SALA DE COMANDO', textKey: 's1_2', speaker: 'capita' },

        /* CENA 04-B: O Hangar Secreto */
        { img: 'cena-2', chapterKey: 'c4b', year: '2201 A.D.', coord: 'ÁREA 51 - SUBTERRÂNEO', textKey: 's2_1', speaker: 'narrador' },
        { img: 'cena-2', chapterKey: 'c4b', year: '2201 A.D.', coord: 'HANGAR SELADO', textKey: 's2_2', speaker: 'capita' },

        /* CENA 04-C: A Descida */
        { img: 'cena-3', chapterKey: 'c4c', year: '2201 A.D.', coord: 'PLATAFORMA DE DESCIDA', textKey: 's3_1', speaker: 'fox' },
        { img: 'cena-3', chapterKey: 'c4c', year: '2201 A.D.', coord: 'PLATAFORMA DE DESCIDA', textKey: 's3_2', speaker: 'capita' },
        { img: 'cena-3', chapterKey: 'c4c', year: '2201 A.D.', coord: 'NAVE DE DESCIDA', textKey: 's3_3', speaker: 'player' }
    ];

    const BASE = '../assets/img/cenarios/cenario-missao/inicio-game/';
    const SLIDE_DURATION = 12000;

    let current = 0;
    let frontImg = 'a';
    let busy = false;
    let autoTimer = null;
    let typeTimer = null;

    const imgA = document.getElementById('scene-img-a');
    const imgB = document.getElementById('scene-img-b');
    const dialogue = document.getElementById('dialogue');
    const chapterLbl = document.getElementById('chapter-label');
    const continueHint = document.getElementById('continue-hint');
    const yearLbl = document.getElementById('year-label');
    const coordLbl = document.getElementById('coord-label');
    const progressBar = document.getElementById('progress-bar');
    const fadeOut = document.getElementById('fade-out');
    const glitch = document.getElementById('glitch-flash');
    const speakerImg = document.getElementById('speaker-img');
    const speakerName = document.getElementById('speaker-name');

    if (continueHint) continueHint.textContent = tr.hint;

    function startProgressBar() {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        void progressBar.offsetWidth;
        progressBar.style.transition = `width ${SLIDE_DURATION}ms linear`;
        progressBar.style.width = '100%';
    }

    function resetProgressBar() {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
    }

    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    const STARS = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function initStars() {
        STARS.length = 0;
        for (let i = 0; i < 260; i++) {
            STARS.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.4 + 0.2,
                op: Math.random()
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        STARS.forEach((s) => {
            s.op += 0.012;
            const a = (Math.sin(s.op) * 0.5 + 0.5) * 0.8 + 0.15;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.fill();
        });
        requestAnimationFrame(drawStars);
    }

    function typewrite(el, text, speed = 26) {
        clearTimeout(typeTimer);
        el.textContent = '';
        let i = 0;
        function tick() {
            if (i < text.length) {
                el.textContent += text[i++];
                typeTimer = setTimeout(tick, speed);
            }
        }
        tick();
    }

    function getActive() { return frontImg === 'a' ? imgA : imgB; }
    function getInactive() { return frontImg === 'a' ? imgB : imgA; }

    function triggerGlitch() {
        glitch.classList.remove('flash');
        void glitch.offsetWidth;
        glitch.classList.add('flash');
    }

    function loadScene(idx, instant) {
        const scene = scenes[idx];
        const inactive = getInactive();
        const active = getActive();

        inactive.src = BASE + scene.img + '.png';
        inactive.classList.remove('kb-active');
        void inactive.offsetWidth;

        if (instant) {
            active.style.opacity = '0';
            inactive.style.opacity = '1';
            inactive.classList.add('kb-active');
            frontImg = frontImg === 'a' ? 'b' : 'a';
        } else {
            triggerGlitch();
            inactive.style.opacity = '0';
            inactive.onload = () => {
                inactive.classList.add('kb-active');
                requestAnimationFrame(() => {
                    inactive.style.opacity = '1';
                    active.style.opacity = '0';
                    frontImg = frontImg === 'a' ? 'b' : 'a';
                });
            };
            if (inactive.complete && inactive.naturalWidth) {
                inactive.onload = null;
                inactive.classList.add('kb-active');
                requestAnimationFrame(() => {
                    inactive.style.opacity = '1';
                    active.style.opacity = '0';
                    frontImg = frontImg === 'a' ? 'b' : 'a';
                });
            }
        }

        chapterLbl.textContent = tr.chapters[scene.chapterKey] || '';
        yearLbl.textContent = 'YEAR - ' + scene.year;
        coordLbl.textContent = scene.coord;
        typewrite(dialogue, tr.lines[scene.textKey] || '');

        // 🖼️ Atualiza Retrato e Nome do Personagem
        if (speakerImg) {
            const imgPath = CHAR_IMAGES[scene.speaker];
            if (imgPath) {
                speakerImg.src = imgPath;
                speakerImg.parentElement.style.opacity = '1';
            } else {
                speakerImg.parentElement.style.opacity = '0'; // Esconde se for narrador
            }
        }
        if (speakerName) {
            speakerName.textContent = tr.speakers[scene.speaker] || '';
        }

        document.body.classList.add('letterbox-open');

        clearTimeout(autoTimer);
        startProgressBar();
        autoTimer = setTimeout(advance, SLIDE_DURATION);
    }

    function advance() {
        if (busy) return;
        current++;
        if (current >= scenes.length) {
            endStory();
            return;
        }
        busy = true;
        resetProgressBar();
        loadScene(current, false);
        setTimeout(() => { busy = false; }, 1400);
    }

    function endStory() {
        busy = true;
        fadeOut.classList.add('active');
        clearTimeout(autoTimer);
        clearTimeout(typeTimer);

        setTimeout(() => {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage('historiaCena04Ended', '*');
            } else {
                current = 0;
                loadScene(0, true);
                fadeOut.classList.remove('active');
                busy = false;
            }
        }, 1900);
    }

    document.addEventListener('click', advance);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            e.preventDefault();
            endStory();
            return;
        }
        if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'Enter') {
            e.preventDefault();
            advance();
        }
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
        initStars();
    });

    resizeCanvas();
    initStars();
    drawStars();
    loadScene(0, true);
})();
