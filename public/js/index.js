var socket = io("127.0.0.1:8000");
const inputarea = document.getElementById("input");
const outputarea = document.getElementById("output")
var code_source = 'type';
socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on("code-typed", function(data) {
    var editor = ace.edit("editor");
    $("#lang").val(data.lang).change();
    code_source = 'socket';
    editor.setValue(data.code);
})

socket.on("input-changed", function(data) {
    inputarea.value = data.input;
})
socket.on("output-changed", function(data) {
    outputarea.value = data.output;
})
inputarea.oninput = function(value) {
    console.log("input changed", inputarea.value);
    socket.emit('input-changed', { input: inputarea.value }, function(err) {
        if (err) {
            alert(err);
            window.location.href = "/";
        } else {
            console.log("No error");
        }
    })
};

function loadSettings() {
    var editor = ace.edit("editor");
    let lang = sessionStorage.lang;
    let code = sessionStorage.code;
    if (lang === undefined)
        lang = 'c';
    $("#lang").val(lang).change();

    editor.session.setMode("ace/mode/" + getLang(lang));
    if (code !== undefined) {
        editor.setValue(code);
    }


}

function saveSettings() {
    var editor = ace.edit("editor");
    sessionStorage.code = editor.getValue();
    sessionStorage.lang = $("#lang option:selected").val();
}

function getLang(lang) {
    if (lang == 'c' || lang == 'cpp')
        return 'c_cpp';
    return lang;
}
$(document).ready(function() {
    $(window).on('beforeunload', function() {
        saveSettings();
    });
    $('#welcome-modal').modal('show');
    loadSettings();
    var editor = ace.edit("editor");
    console.log(editor);
    editor.on("change", function(obj) {
        console.log("code changed", editor.getValue());
        if (sessionStorage.source === 'candidate') {
            socket.emit('code-typed', { code: editor.getValue(), lang: $("#lang option:selected").val() }, function(err) {
                if (err) {
                    alert(err);
                    window.location.href = "/";
                } else {
                    console.log("No error");
                }
            })
        }

    })
    editor.setTheme("ace/theme/chrome");
    editor.session.setMode("ace/mode/" + getLang($("#lang option:selected").val()));
    jQuery('#lang').on('change', function() {
        editor.session.setMode("ace/mode/" + getLang($("#lang option:selected").val()));
    });
    jQuery('#join-button').on('click', function(e) {
        const source = $("input[name='source']:checked").val();
        const name = $("#name").val();
        const room = $("#room-id").val();
        sessionStorage.source = source;
        if (source === 'interviewer') {
            editor.setReadOnly(true)
        }
        $('#welcome-modal').modal('hide');
        socket.emit('join', { name, source, room }, function(err) {
            if (err) {
                alert(err);
                window.location.href = "/";
            } else {
                console.log("No error");
            }
        });

    });
    jQuery('#run-button').on('click', function(e) {

        var jsonObj = {
            code: editor.getValue(),
            lang: $("#lang option:selected").val(),
            input: $("#input").val()
        };
        e.preventDefault();
        $('#run-button').addClass('is-loading');
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                $('#run-button').removeClass('is-loading');
                var result = JSON.parse(this.responseText);
                $('#output').val(result.output);
                socket.emit('output-changed', { output: outputarea.value }, function(err) {
                    if (err) {
                        alert(err);
                        window.location.href = "/";
                    } else {
                        console.log("No error");
                    }
                });
                setTimeout(() => {
                    $('#notify').attr('class', 'notification')
                }, 3500);
            } else if (this.readyState == 4 && this.status == 201) {
                $('#run-button').removeClass('is-loading');
                var result = JSON.parse(this.responseText);
                $('#notify').html('Error: ' + result.errorType);
                $('#notify').addClass('is-danger animate-peek');
                $('#output').val(result.error);
                socket.emit('output-changed', { output: outputarea.value }, function(err) {
                    if (err) {
                        alert(err);
                        window.location.href = "/";
                    } else {
                        console.log("No error");
                    }
                });
                setTimeout(() => {
                    $('#notify').attr('class', 'notification')
                }, 3500);
            } else if (this.readyState == 4 && this.status == 400) {
                $('#run-button').removeClass('is-loading');
                $('#notify').html('Error');
                $('#notify').addClass('is-danger animate-peek');
                setTimeout(() => {
                    $('#notify').attr('class', 'notification')
                }, 3500);
            }
        };
        xhttp.open("POST", "http://ide.shobhitagarwal.me/api/question/run", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(jsonObj));
    });




});