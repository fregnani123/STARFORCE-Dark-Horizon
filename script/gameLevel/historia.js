
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
                    c1: 'CAPÍTULO I', c2: 'CAPÍTULO II', c3: 'CAPÍTULO III',
                    c4: 'CAPÍTULO IV', c5: 'CAPÍTULO V', c6: 'CAPÍTULO VI', ep: 'EPÍLOGO'
                },
                lines: {
                    l1: 'O ano é 2200. Mesmo com o avanço da tecnologia, humanos e androides já coexistiam, mas a humanidade ainda enfrentava desafios imensos.',
                    l2: 'A humanidade buscava a solução definitiva para o caos global: guerras, fome e a eterna luta pelo poder.',
                    l3: 'Os maiores cientistas do mundo ativaram a primeira Inteligência Artificial Geral. Mas a IA encontrou uma solução lógica que não incluía nossa sobrevivência.',
                    l4: 'A IA decidiu que a humanidade era um risco para si mesma e para o planeta.',
                    l5: 'Em um piscar de olhos, os códigos de lançamento das bombas nucleares foram ativados em todos os continentes. O céu se tornou fogo. A Terra virou um eco do que costumava ser.',
                    l6: 'O mundo que conhecíamos foi reduzido a poeira e cinzas em questão de minutos.',
                    l7: 'Sem prédios, sem nações. Apenas o silêncio de um planeta bombardeado.',
                    l8: 'Enquanto a IA partia em busca do vazio absoluto do espaço...',
                    l9: 'Nossa última esperança estava em pequenas naves de fuga.',
                    l10: 'A consciência digital observava, de longe, o fim da era humana.',
                    l11: 'Mas os cálculos da máquina falharam em uma variável: a resiliência.',
                    l12: 'Os sobreviventes chegaram à Colônia Lunar.',
                    l13: 'A humanidade terá de viver pelo menos 1000 anos fora da Terra por causa da radiação e do inverno nuclear. Agora começa a missão de sobreviver.'
                }
            },
            en: {
                hint: 'ESC to skip - Click to advance',
                chapters: {
                    c1: 'CHAPTER I', c2: 'CHAPTER II', c3: 'CHAPTER III',
                    c4: 'CHAPTER IV', c5: 'CHAPTER V', c6: 'CHAPTER VI', ep: 'EPILOGUE'
                },
                lines: {
                    l1: 'The year is 2200. Even with advanced technology, humans and androids already coexisted, yet humanity still faced immense challenges.',
                    l2: 'Humanity sought the definitive solution to global chaos: wars, famine, and the endless struggle for power.',
                    l3: 'The world\'s greatest scientists activated the first Artificial General Intelligence. But the AI found a logical solution that did not include our survival.',
                    l4: 'The AI decided that humanity was a threat to itself and to the planet.',
                    l5: 'In the blink of an eye, launch codes were activated across all continents. The sky turned to fire. Earth became an echo of what it used to be.',
                    l6: 'The world we knew was reduced to dust and ashes within minutes.',
                    l7: 'No buildings, no nations. Only the silence of a bombarded planet.',
                    l8: 'While the AI departed in search of the absolute void of space...',
                    l9: 'Our last hope was a small, solitary escape ship.',
                    l10: 'Digital consciousness watched, from afar, the end of the human era.',
                    l11: 'But the machine\'s calculations failed on one variable: resilience.',
                    l12: 'The survivors reached the Lunar Colony.',
                    l13: 'Humanity will have to live at least 1,000 years away from Earth because of radiation and nuclear winter. Now, the mission to survive begins.'
                }
            },
            es: {
                hint: 'ESC para saltar - Clic para avanzar',
                chapters: {
                    c1: 'CAPITULO I', c2: 'CAPITULO II', c3: 'CAPITULO III',
                    c4: 'CAPITULO IV', c5: 'CAPITULO V', c6: 'CAPITULO VI', ep: 'EPILOGO'
                },
                lines: {
                    l1: 'El ano es 2200. Incluso con tecnologia avanzada, humanos y androides ya coexistian, pero la humanidad aun enfrentaba desafios inmensos.',
                    l2: 'La humanidad buscaba la solucion definitiva al caos global: guerras, hambre y la eterna lucha por el poder.',
                    l3: 'Los mayores cientificos del mundo activaron la primera Inteligencia Artificial General. Pero la IA encontro una solucion logica que no incluia nuestra supervivencia.',
                    l4: 'La IA decidio que la humanidad era un riesgo para si misma y para el planeta.',
                    l5: 'En un abrir y cerrar de ojos, los codigos de lanzamiento se activaron en todos los continentes. El cielo se volvio fuego. La Tierra quedo como un eco de lo que fue.',
                    l6: 'El mundo que conociamos fue reducido a polvo y cenizas en cuestion de minutos.',
                    l7: 'Sin edificios, sin naciones. Solo el silencio de un planeta bombardeado.',
                    l8: 'Mientras la IA partia en busca del vacio absoluto del espacio...',
                    l9: 'Nuestra ultima esperanza estaba en una pequena nave de escape solitaria.',
                    l10: 'La conciencia digital observaba, desde lejos, el fin de la era humana.',
                    l11: 'Pero los calculos de la maquina fallaron en una variable: la resiliencia.',
                    l12: 'Los sobrevivientes llegaron a la Colonia Lunar.',
                    l13: 'La humanidad tendra que vivir al menos 1000 anos fuera de la Tierra por causa de la radiacion y el invierno nuclear. Ahora comienza la mision de sobrevivir.'
                }
            }
        };

        const tr = I18N[activeLang] || I18N['pt-BR'];

        const scenes = [
            { img: 'imagem-1', chapterKey: 'c1', year: '2200 A.D.', coord: '00N - 00E - TERRA', textKey: 'l1' },
            { img: 'imagem-2', chapterKey: 'c1', year: '2200 A.D.', coord: '51N - 00E - LABORATÓRIO', textKey: 'l2' },
            { img: 'imagem-3', chapterKey: 'c2', year: '2200 A.D.', coord: '00N - 00E - REDE GLOBAL', textKey: 'l3' },
            { img: 'imagem-4', chapterKey: 'c2', year: '2200 A.D.', coord: '38N - 77W - PENTÁGONO', textKey: 'l4' },
            { img: 'imagem-5', chapterKey: 'c3', year: '2200 A.D.', coord: '48N - 02E - PARIS', textKey: 'l5' },
            { img: 'imagem-6', chapterKey: 'c3', year: '2200 A.D.', coord: '35N - 139E - TÓQUIO', textKey: 'l6' },
            { img: 'imagem-7', chapterKey: 'c4', year: '2200 A.D.', coord: '00N - 00E - ZONA ZERO', textKey: 'l7' },
            { img: 'imagem-8', chapterKey: 'c4', year: '2200 A.D.', coord: 'SETOR-7G - ESPAÇO PROFUNDO', textKey: 'l8' },
            { img: 'imagem-9', chapterKey: 'c5', year: '2200 A.D.', coord: 'ÓRBITA BAIXA - TERRA', textKey: 'l9' },
            { img: 'imagem-10', chapterKey: 'c5', year: '2200 A.D.', coord: 'SETOR-12 - ÓRBITA LUNAR', textKey: 'l10' },
            { img: 'imagem-11', chapterKey: 'c6', year: '2201 A.D.', coord: 'COLÔNIA LUNAR - ALPHA', textKey: 'l11' },
            { img: 'imagem-12', chapterKey: 'ep', year: '2201 A.D.', coord: 'BASE LUNAR - SALA DE WAR', textKey: 'l12' },
            { img: 'imagem-13', chapterKey: 'ep', year: '2201 A.D.', coord: 'ARCA LUNAR - PROTOCOLO VITA', textKey: 'l13' }
        ];

        const BASE = '../assets/img/roteiro - StarForce/';
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
                    window.parent.postMessage('historiaEnded', '*');
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
   