/*
=============================================
Author      : <ยุทธภูมิ ตวันนา>
Create date : <๐๕/๐๖/๒๕๖๔>
Modify date : <๓๐/๐๖/๒๕๖๔>
Description : <>
=============================================
*/

'use strict';

const appWidth = 242;
const pictureWidth = 230;
const pictureHeight = 312;
const studentUniform = {
    male: {
        default: maleStudentUniform
    },
    female: {
        default: femaleStudentUniform,
        muslim: femaleMuslimStudentUniform
    }
};
const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const snapSoundElement = document.getElementById('snapSound');
const webcam = new Webcam(webcamElement, 'user', canvasElement, snapSoundElement);

$('#webcamSwitch').bootstrapToggle('off');
$('input[name="gender"]').change();

function displayError(err) {
    if (err !== undefined && err.length > 0)
        $('#errorMsg').html(err);
    
    $('#webcamApp').css('width', '100%');
    $('#selectGender').addClass('d-none');
    $('#cameraContainer').addClass('d-none');
    $('#cameraControls .btn').addClass("d-none");
    $('#cameraOff').css('margin-right', '0');
    $('#cameraOff, #cameraControls').removeClass("d-none");
    $('#errorMsg').removeClass('d-none');
}

function setCameraPositionLeft() {
    let cameraWidth = webcamElement.scrollWidth;
    let cameraLeft = getCameraPositionLeft();

    if (cameraWidth >= pictureWidth)
        webcamElement.style.left = ('-' + cameraLeft + 'px');
    else {
        cameraStopped();
        displayError('');
        $('#errorMsg .msg3').removeClass('d-none');
    }
}

function getCameraPositionLeft() {
    let cameraWidth = webcamElement.scrollWidth;
    let cameraLeft = ((cameraWidth - pictureWidth) / 2);

    return cameraLeft;
}

function cameraStarted() {
    $('#errorMsg').addClass('d-none');
    $('.flash').hide();
    $('#cameraFlip.btn').prop('disabled', (webcam.webcamList.length > 1 ? false : true));

    removeCapture();
    setCameraPositionLeft();
}

function cameraStopped() {
    $('#webcamApp').css('width', (appWidth + 'px'));
    $('#errorMsg').addClass('d-none');
    $('#selectGender').removeClass('d-none');
    $('#cameraContainer').removeClass('d-none');
    $('.flash').hide();
    $('#webcamControl').removeClass('d-none');
    $('#webcamContainer').addClass('d-none');
    $('#cameraOff').addClass('d-none');
    $('#takePhoto').addClass('d-none');
    $('#cameraFlip').addClass('d-none');
    $('#downloadPhoto').addClass('d-none');
    $('#resumeCamera').addClass('d-none');
    $('#cameraControls').addClass('d-none');
}

function beforeTakePhoto() {
    $('.flash')
        .show()
        .animate({
            opacity: 0.3
        }, 500)
        .fadeOut(500)
        .css({
            'opacity': 0.7
        });
    $('#selectGender .btn').addClass('disabled');
    $('#selectGender input[name="gender"]').prop('disabled', true);
    $('#webcamControl').addClass('d-none');
    $('#cameraControls').addClass('d-none');
}

function afterTakePhoto() {
    webcam.stop();
    $('#canvas').removeClass('d-none');
    $('#takePhoto').addClass('d-none');
    $('#cameraFlip').addClass('d-none');
    $('#downloadPhoto').removeClass('d-none');
    $('#resumeCamera').removeClass('d-none');
    $('#cameraControls').removeClass('d-none');
}

function getUniform(gender) {
    let uniform;

    if (gender !== undefined) {
        switch (gender) {
            case 'male':
            uniform = studentUniform.male.default;
            break;
        case 'female':
            uniform = studentUniform.female.default;
            break;
        case 'female-muslim':
            uniform = studentUniform.female.muslim;
            break;
        }
    }

    return uniform;
}

function removeCapture(){
    $('#webcamControl').addClass('d-none');
    $('#webcamContainer').removeClass("d-none");
    $('#cameraOff').removeClass('d-none');
    $('#canvas').addClass('d-none');
    $('#takePhoto').removeClass('d-none');
    $('#cameraFlip').removeClass('d-none');
    $('#downloadPhoto').addClass('d-none');
    $('#resumeCamera').addClass('d-none');
    $('#cameraControls').removeClass("d-none"); 
}

$('input[name="gender"]').change(function () {
    if ($(this).is(':checked'))
        $('.studentUniform').css('background-image', 'url(' + getUniform($(this).val()) + ')');
});

$('#webcamSwitch').change(function () {
    var switchStatus = $(this).prop('checked')
    
    if (switchStatus) {
        webcam.start()
            .then((result) => {
                setTimeout(function () {
                    cameraStarted();
                }, 500);
            })
            .catch((err) => {
                displayError('');
                $('#errorMsg .msg1').removeClass('d-none');
        });
    }
    else {
        cameraStopped();
        webcam.stop();
    }
});

 
$('#takePhoto').click(function () {
    beforeTakePhoto();
    
    let picture = webcam.snap();
   
    let canvas = document.getElementById('canvas');
    canvas.width = $('.canvas').width();
    canvas.height = $('.canvas').height();

    let context = canvas.getContext('2d');
        
    let imgLayer1 = new Image;
    imgLayer1.src = picture;
    imgLayer1.onload = function () {
        context.drawImage(imgLayer1, getCameraPositionLeft(), 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        
        let canvasResult = document.getElementById('canvasResult');
        canvasResult.width = $('.canvas').width();
        canvasResult.height = $('.canvas').height();
        
        let contextResult = canvasResult.getContext('2d');
    
        let imgLayer2 = new Image;
        imgLayer2.src = getUniform($('input[name="gender"]:checked').val());
        imgLayer2.onload = function () {
            contextResult.drawImage(canvas, 0, 0, canvasResult.width, canvasResult.height);
            contextResult.drawImage(imgLayer2, 0, 0);
        
            document.querySelector('#savePhoto').href = canvasResult.toDataURL('image/png');;

            afterTakePhoto();
        };
    }
});

$('#cameraOff').click(function () {
    $('#webcamSwitch').prop('checked', false).change();
});

$('#downloadPhoto').click(function () {
    $('#savePhoto')[0].click();
});

$('#cameraFlip').click(function() {
    webcam.flip();
    webcam.start();
});

$('#resumeCamera').click(function () {
    webcam.stream()
        .then((facingMode) =>{
            $('#selectGender .btn').removeClass('disabled');
            $('#selectGender input[name="gender"]').prop('disabled', false);
            removeCapture();
        });
});