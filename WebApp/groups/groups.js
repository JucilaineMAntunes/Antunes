import '../js/datatables'

$(function () {
    let saveClicked = false;

    let dataTable = $('#groups').DataTable({
        ajax: {
            url: '/api/dispatcher/groups',
            dataSrc: ''
        },
        dom: "<'row mb-3'<'col'B>>" +
            "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        columns: [
            { data: 'alias' },
            { data: 'radioAlias' }
        ],
        order: [[0, 'asc']],
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
                    $('form').prop('action', '/api/dispatcher/groups/add').find('.invalid-feedback, .alert').hide();
                     $('#groupForm :input').val("");
 
                     loadRadios();
 
                     let label = $('#groupModalLabel');
                     label.text(label.data('label-add'));
                     $('#groupModal').modal('show');
                }
            },
            {
                extend: 'selectedSingle',
                text: 'Change',
                action: function (_, dt) {
                    $('form').prop('action', '/api/dispatcher/groups/update').find('.invalid-feedback, .alert').hide();
                    let record = dt.row({ selected: true }).data();
                    $('#alias').val(record.alias);

                    loadRadios(record.radioGuid);

                    let label = $('#groupModalLabel');
                    label.text(label.data('label-change'));
                    $('#groupModal').modal('show');

                    $('#btnSaveGroup').prop("disabled", true);
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

    
    function loadRadios(selectedItem) {
        $.ajax('/api/dispatcher/stations', {
            method: 'GET',
            contentType: 'application/json',
            success: function (data) {
                let radios = $('#radioGuid');
                radios.find('option').not(':first').remove();
                data.forEach(function (item) {
                    let selected = selectedItem !== undefined && selectedItem === item.guid;
                    let option = new Option(item.alias, item.guid, selected, selected);
                    radios.append(option);
                });
            }
        });
    }

    function reloadTable() {      
        $('#groupModal,#confirmModal').modal('hide');

        dataTable.clear();
        dataTable.ajax.reload();
        dataTable.draw();
    }

    $('#groupForm :input').change(enableButtons);
    $('#groupForm :input').keyup(enableButtons);

    function enableButtons(event) {
        if (event.keyCode !== 9) {
            $('#btnSaveGroup').prop('disabled', false);
        }
    }

    $('#btnSaveGroup').on('click', function () {
        $('.invalid-feedback').hide();
        $('#groupModal').modal('hide');
        saveClicked = true;
    });

    $('#groupModal').on('hidden.bs.modal', function () {
        if (saveClicked) {            
            saveGroup();
            saveClicked = false;
        }
    });

    function saveGroup() {
        let rowData = dataTable.row({ selected: true }).data();
        let radioGuid = $('#radioGuid').val() !== "" ? $('#radioGuid').val() : null;

        let data = JSON.stringify({
            guid: (rowData && rowData['guid']) || null,
            radioGuid: radioGuid || "00000000000000000000000000000000",
            alias: $('#alias').val()
        });
        $.ajax($('form').prop('action'), {
            method: 'POST',
            contentType: 'application/json',
            data: data
        }).then(reloadTable, function (result) {
            $('#groupModal').modal('show');

            let errors = result.responseJSON.errors || [];
            let msg = result.statusText || null;
            for (let field in errors) {
                $(`#${field} ~ .invalid-feedback`).show().html(errors[field].map(x => x.errorMessage).join('<br/>'));
            }

            if (msg) {
                $('#groupModal .alert').show().text(msg);
            };
        });
    }

    $('#btnConfirmDeleteGroup').on('click', function () {
       
        let data = JSON.stringify(dataTable.rows({ selected: true }).data().toArray());
        $.ajax('/api/dispatcher/groups/delete', {
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
