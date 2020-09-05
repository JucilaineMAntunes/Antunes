let saveClicked = false;
let defaultDataText = $("#data-label").text();

$(function () {
    let dataTable = $('#multimediaFiles').DataTable({
        ajax: {
            url: '/api/dispatcher/multimedia-files',
            dataSrc: ''
        },
        language: { url: '/api/resources/resources.json' },
        dom: "<'row mb-3'<'col'B>>" +
            "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        columns: [
            {
                data: 'isPublic', searchable: false, render: function (data, type) {
                    if (type === 'display' || type === 'filter') {
                        if (data) {
                            return '<svg height="24" width="24" data-sort="1"><use xlink: href="#icon-checked"></user></svg>';
                        } else {

                            return '<svg height="24" width="24" data-sort="0"><use xlink:href="#icon-unchecked"</user></svg>';
                        }
                    }
                    return data;
                }
            },

            { data: 'description' },
            { data: 'ownerUserName' }
        ],
        order: [[0, 'desc']],
        select: {
            style: 'os'
        },
        responsive: {
            breakpoints: [
                { name: 'xl', width: Infinity },
                { name: 'lg', width: 1200 },
                { name: 'md', width: 992 },
                { name: 'sm', width: 768 },
                { name: 'xs', width: 576 }
            ]
        },
        buttons: [
            {
                text: 'Add',
                action: function () {
                    $('form').prop('action', '/api/dispatcher/multimedia-files/add').find('.invalid-feedback, .alert').hide();

                    $('#multimediaFileForm :input').val("");
                    $('#public').prop('checked', true);
                    $("#data-label").text(defaultDataText);


                    let label = $('#multimediaFileModalLabel');
                    label.text(label.data('label-add'));
                    $('#multimediaFileModal').modal('show');
                }
            },
            {
                extend: 'selectedSingle',
                text: 'Change',
                action: function (_, dt) {
                    $('form').prop('action', '/api/dispatcher/multimedia-files/update').find('.invalid-feedback, .alert').hide();

                    let record = dt.row({ selected: true }).data();
                    $('#description').val(record.description);
                    $('#public').prop('checked', record.isPublic);
                    $("#data-label").text(record.fileName + '.' + record.fileType);
                    $('#fileData').val('');

                    let label = $('#multimediaFileModalLabel');
                    label.text(label.data('label-change'));
                    $('#multimediaFileModal').modal('show');

                    $('#btnSaveMultimediaFiles').prop("disabled", true);
                }
            },
            {
                extend: 'selected',
                text: 'Delete',
                action: function () {
                    $('#confirmModal').modal('show');
                }
            }
        ]
    });

    dataTable.on('draw', showYesNoTranslationOnPagination);

    function reloadTable() {

        $('#multimediaFileModal,#confirmModal').modal('hide');

        dataTable.clear();
        dataTable.ajax.reload();
        dataTable.draw();
    }

    $('#multimediaFileForm :input').change(enableButtons);
    $('#multimediaFileForm :input').keyup(enableButtons);

    function enableButtons(event) {
        if (event.keyCode !== 9) {
            $('#btnSaveMultimediaFiles').prop('disabled', false);
        }
    }

    $('#btnSaveMultimediaFiles').on('click', function () {
        $('.invalid-feedback').hide();
        $('#multimediaFileModal').modal('hide');

        saveClicked = true;
    });

    $('#multimediaFileModal').on('hidden.bs.modal', function () {
        if (saveClicked) {
            prepareSaveMultimediaFile();
            saveClicked = false;
        }
    });

    function prepareSaveMultimediaFile() {
        let rowData = dataTable.row({ selected: true }).data();

        let file = ($('#fileData')[0]).files[0] ? ($('#fileData')[0]).files[0].name : $("#data-label").text();
        var fileFullName = file.split('.');
        let fileType = fileFullName[fileFullName.length - 1];
        let fileName = file.replace('.' + fileType, '');


        let fileReader = new FileReader(); 
        fileReader.onload = function (e) {
            let fileData = (e.target).result.split(',')[1] ? (e.target).result.split(',')[1] : null;

            let data = JSON.stringify({
                guid: (rowData && rowData['guid']) || null,
                fileName: fileName,
                fileType: fileType,
                fileData: fileData,
                description: $('#description').val(),
                isPublic: $('#public').prop('checked')
            });
            saveMultimediaFile(data);
        };
        if (($('#fileData')[0]).files[0])
            fileReader.readAsDataURL(($('#fileData')[0]).files[0]);
        else {
            let data = JSON.stringify({
                guid: (rowData && rowData['guid']) || null,
                fileName: fileName,
                fileType: fileType,
                fileData: [],
                description: $('#description').val(),
                isPublic: $('#public').prop('checked')
            });
            saveMultimediaFile(data);
        }
    }

    $("#fileData").change(function () {
        $("#data-label").text(($('#fileData')[0]).files[0].name)
    });

    function saveMultimediaFile(data) {
        $.ajax($('form').prop('action'), {
            method: 'POST',
            contentType: 'application/json',
            data: data
        }).then(reloadTable, function (result) {
            $('#multimediaFileModal').modal('show');
            
            let errors = result.responseJSON.errors || [];
            let msg = result.statusText || null;
            for (let field in errors) {
                $(`#${field} ~ .invalid-feedback`).show().html(errors[field].map(x => x.errorMessage).join('<br/>'));
            }

            if (msg) {
                $('#multimediaFileModal .alert').show().text(msg);
            };
        });
    }

    $('#btnConfirmDeleteMultimediaFile').on('click', function () {
        
        let data = JSON.stringify(dataTable.rows({ selected: true }).data().toArray());
        $.ajax('/api/dispatcher/multimedia-files/delete', {
            method: 'POST',
            contentType: 'application/json',
            data: data,
            error: function (result) {
               
                let msg = result.statusText || null;
                let errors = result.responseJSON.errors || [];
                console.log(errors);
                console.log(result);
                if (msg) {
                    msg += "<br /><br />";
                    for (let error in errors) {
                        msg += `Erro em ${error}: `;
                        msg += errors[error].map(x => x.errorMessage);
                        msg += "<br />";
                    }
                    $('#confirmModal').modal('hide');
                    $('#errorText').html(msg);
                    $('#errorModal').modal('show');
                }
            }
        }).then(reloadTable);
    });
});
