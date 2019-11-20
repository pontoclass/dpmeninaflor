window.objWasm = null;
window.arquivosCache = false;
var cartaoAtivo = false,
    olhoAtivo = false,
    qtdeOlhosMarcados = 0,
    cartaoMarcado = false,
    MedidaOlho1X = 0.0,
    MedidaOlho1Y = 0.0,
    MedidaOlho2X = 0.0,
    MedidaOlho2Y = 0.0,
    MedidaMaxCartao = 0.0,
    startX, endX, startY, endY,
    mouseIsDown = 0,
    drawRequest,
    pointSize = 3,
    card = null,
    cardCtx = null,
    image = null,
    imageCtx = null,
    video = null,
    videoCtx = null,
    eyes = null,
    eyesCtx = null,
    novaFoto = false;

// #region Calculo DP
// Abre o Modal com a câmera sendo capturada.
function abrirCalculoDP() {
    $("#modalCalculoDP").modal("show");
    $("#dvWebCam").css("display", "block");
    $("#dvCalculateDP").css("display", "none");
    $("#foto").css("display", "block");
    $("#selecionaFoto").css("display", "none");

    cartaoAtivo = true;
    olhoAtivo = false;

    eyes = document.getElementById('eyes');
    eyesCtx = eyes.getContext('2d');

    card = document.getElementById('card');
    cardCtx = card.getContext('2d');

    image = document.getElementById('image');
    imageCtx = image.getContext('2d');

    video = document.getElementById('video');

    // Get access to the camera!
    try {
        if (hasGetUserMedia()) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
                video.srcObject = stream;
                video.play();
            });
        } else {
            alert('getUserMedia() is not supported by your browser');
        }
    } catch (e) {
        alert("Falha ao acessar a camera!")
        // viewModal(3, "Falha ao acessar a camera!");
    }

    video.addEventListener("canplay", canPlay, false);
    
}

function canPlay() {
    setSize();
    $("#dvCalculateDP").css("min-height", video.height + 30 + "px");
    $("#modalCalculoDP .modal-body").css("min-height", video.height + 70 + "px");
}

// Tirar Foto
function tirarFoto() {
    imageCtx.drawImage(video, 0, 0, image.width, image.height);
    $("#foto").css("display", "none");
    $("#selecionaFoto").css("display", "block");
    $("#dvWebCam").hide();
    $("#dvCalculateDP").show();
    initList();
}

// Setar os tamanhos da interface
function setSize(scale = 0.65, type = 0) {
    var videowidth = video.videoWidth;
    var videoHeight = video.videoHeight;

    if (type === 0 || type === 1) {
        try {
            card.style.width = videowidth * scale + "px";
            card.style.height = videoHeight * scale + "px";
            card.width = videowidth * scale;
            card.height = videoHeight * scale;
        }
        catch (e) {
            console.log("Overlay deu ruim.");
        }
    }

    if (type === 0 || type === 2) {
        try {
            eyes.style.width = videowidth * scale + "px";
            eyes.style.height = videoHeight * scale + "px";

            eyes.width = videowidth * scale;
            eyes.height = videoHeight * scale;
        }
        catch (e) {
            console.log("Canvas deu ruim.");
        }
    }

    if (type === 0 || type === 3) {
        try {
            video.style.width = videowidth * scale + "px";
            video.style.height = videoHeight * scale + "px";

            video.width = videowidth * scale;
            video.height = videoHeight * scale;
        }
        catch (e) {
            console.log("Vídeo deu ruim.");
        }
    }

    if (type === 0 || type === 4) {
        try {
            image.style.width = videowidth * scale + "px";
            image.style.height = videoHeight * scale + "px";
            image.width = videowidth * scale;
            image.height = videoHeight * scale;
        }
        catch (e) {
            console.log("Imagem deu ruim.");
        }
    }
}

// Testa se o navegador Tem getUserMedia()
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Cálculo Final
function verificaDP() {
    if (cartaoMarcado && qtdeOlhosMarcados === 2) {
        var result = MedidaOlho1X - MedidaOlho2X;
        if (result < -1) {
            result = result * -1;
        }
        var proporcaoCartao = MedidaMaxCartao / 85;
        var resultadoDP = result / proporcaoCartao;
        var dp = parseInt(resultadoDP);
        var dnp = dp / 2;

        if (dp <= 72 && dp >= 0) {
            // $("#MainContent_dp option[value='" + dp + "']").attr("selected", true);
            // $("#modalCalculoDP").modal("hide");
            alert("Parabéns, você conseguiu calcular sua DP! DP=" + dp + " DNP=" + dnp)
            // viewModalTime(0, "Parabéns, você conseguiu calcular sua DP!", 2000);
            clearCanvas();
        } else if (dp < 0) {
            alert("Algo Deu Errado, sua DP está muito pequena. Favor tirar outra Foto!")
            // viewModalTime(3, "Algo Deu Errado, sua DP está muito pequena. Favor tirar outra Foto!", 2000);
        } else if (dp > 72) {
            alert("Algo Deu Errado, sua DP está muito grande. Favor tirar outra Foto!")
            // viewModalTime(3, "Algo Deu Errado, sua DP está muito grande. Favor tirar outra Foto!", 2000);
        }
    }
    else {
        alert("Favor selecionar o cartão e os dois olhos, para verificar a DP!")
        // viewModal(1, "Favor selecionar o cartão e os dois olhos, para verificar a DP!");
    }
}

// Reseta Foto
function resetFoto() {
    clearCanvas();
    cartaoAtivo = false;
    olhoAtivo = false;
    $("#foto").show();
    $("#dvWebCam").show();
    $("#selecionaFoto").hide();
    $("#dvCalculateDP").hide();
}

// Limpa Canvas
function clearCanvas() {
    eyesCtx.clearRect(0, 0, eyes.width, eyes.height);
    cardCtx.clearRect(0, 0, card.width, card.height);
    qtdeOlhosMarcados = 0;
    MedidaOlho1X = 0.0;
    MedidaOlho1Y = 0.0;
    MedidaOlho2X = 0.0;
    MedidaOlho2Y = 0.0;
    MedidaMaxCartao = 0.0;
    cartaoMarcado = false;
    novaFoto = true;
}

// Instância dos Listeners
function initList() {
    eyes.addEventListener("mousedown", mouseDown, false);
    eyes.addEventListener("mousemove", mouseXYSquare, false);
    eyes.addEventListener("mouseup", mouseUpSquare, false);
}

// Click do mouse
function mouseDown(event) {
    var pos;
    if (cartaoAtivo) {
        mouseIsDown = 1;
        pos = getMousePos(card, event);
        startX = endX = pos.x;
        startY = endY = pos.y;
        drawSquare();
    }

    if (olhoAtivo) {
        if (qtdeOlhosMarcados >= 2) {
            eyesCtx.clearRect(0, 0, eyes.width, eyes.height);
            qtdeOlhosMarcados = 0;
        } else {
            qtdeOlhosMarcados++;
            pos = getMousePos(eyes, event);
            drawCoordinates(pos.x, pos.y);
            if (qtdeOlhosMarcados === 1) {
                MedidaOlho1X = pos.x;
                MedidaOlho1Y = pos.y;
            } else {
                MedidaOlho2X = pos.x;
                MedidaOlho2Y = pos.y;
            }
        }
    }
}
// #region Square

// Desenhar Quadrado (Soltar Click do mouse)
function mouseUpSquare(eve) {
    if (cartaoAtivo) {
        if (mouseIsDown !== 0) {
            mouseIsDown = 0;
            var pos = getMousePos(eyes, eve);
            endX = pos.x;
            endY = pos.y;
            drawSquare(); //update on mouse-up
        }
    }
}

// Desenhar Quadrado (Enquanto Click Pressionado)
function mouseXYSquare(eve) {
    if (cartaoAtivo) {
        if (mouseIsDown !== 0) {
            var pos = getMousePos(eyes, eve);
            endX = pos.x;
            endY = pos.y;
            drawSquare();
        }
    }
}

// Desenhando quadrado
function drawSquare() {
    var w = endX - startX;
    var h = endY - startY;
    var offsetX = w < 0 ? w : 0;
    var offsetY = h < 0 ? h : 0;
    var width = Math.abs(w);
    var height = Math.abs(h);
    cardCtx.clearRect(0, 0, card.width, card.height);
    cardCtx.beginPath();
    cardCtx.rect(startX + offsetX, startY + offsetY, width, height);
    cardCtx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    cardCtx.fill();
    cardCtx.lineWidth = 1;
    cardCtx.strokeStyle = 'black';
    cardCtx.stroke();

    if (width > 200 && !novaFoto) {
        alert("Voce precisa tirar outra foto, voce tirou uma foto muito perto!")
        // viewModal(1, "Voce precisa tirar outra foto, voce tirou uma foto muito perto!");
        clearCanvas();
        mouseIsDown = 0;
    }
    else {
        MedidaMaxCartao = width;
        cartaoMarcado = true;
        novaFoto = false;
    }
}

// Posição do Mouse
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// Loop do desenho
function drawLoop() {
    drawRequest = requestAnimFrame(drawLoop);
    if (ct.getCurrentPosition()) {
        ctrack.draw(card);
        var params = ctrack.getCurrentParameters()[0];
        var pos = ctrack.getCurrentPosition();
    }
}
// #endregion Quadrado

// #region Dots
function drawCoordinates(x, y) {
    eyesCtx.fillStyle = "#ff2626"; // Red color
    eyesCtx.beginPath();
    eyesCtx.arc(x, y, pointSize, 0, Math.PI * 2, true);
    eyesCtx.fill();
}
// #endregion

function activeOlho() {
    olhoAtivo = true;
    cartaoAtivo = false;
}

function activeCartao() {
    if (qtdeOlhosMarcados > 0 || cartaoMarcado) {
        if (confirm("Já existe uma marcação feita, deseja refazer?")) {
            cardCtx.clearRect(0, 0, card.width, card.height);
            MedidaMaxCartao = 0.0;
            cartaoMarcado = false;
            olhoAtivo = false;
            cartaoAtivo = true;
        }
    }
    else {
        clearCanvas();
        olhoAtivo = false;
        cartaoAtivo = true;
    }
}
// #endregion Calculo DP