import 'bootstrap'
import 'popper.js'
import '../js/datatables'

let saveClicked = false;
let userGuid = null;

$(function () {

    var dataTable = $('#accessGroups').DataTable({
        ajax: {
            url: '/api/dispatcher/access-groups',
            dataSrc: ''
        },
        dom: "<'row mb-3'<'col'B>>" +
            "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        columns: [
            { data: 'name' }
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
                    $('form').prop('action', '/api/dispatcher/access-groups/add').find('.invalid-feedback, .alert').hide();
                    $('#accessGroupForm :input').val("");

                    let label = $('#accessGroupModalLabel');
                    label.text(label.data('label-add'));
                    $('#accessGroupModal').modal('show');
                }
            },
            {
                extend: 'selectedSingle',
                text: 'Change',
                action: function (_, dt) {
                    $('form').prop('action', '/api/dispatcher/access-groups/update').find('.invalid-feedback, .alert').hide();
                    let record = dt.row({ selected: true }).data();
                    $('#name').val(record.name);

                    let label = $('#accessGroupModalLabel');
                    label.text(label.data('label-change'));
                    $('#accessGroupModal').modal('show');

                    $('#btnSaveAccessGroup').prop("disabled", true);

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

    if (userGuid === null) {
        $.ajax('/api/dispatcher/users/current-user-guid', {
            method: 'GET',
            contentType: 'application/json',
            success: function (data) {
                userGuid = data;
                $.ajax('/api/dispatcher/users/' + userGuid + '/security-properties/groups/' + 'Web' + '/properties/' + 'ChangePublicAccessGroups', {
                    method: 'GET',
                    contentType: 'application/json',
                    success: function (properties) {
                        if (properties === undefined || properties === null) {
                            changePublicAccessGroups = false;
                        } else {
                            changePublicAccessGroups = true;
                        }
                    }
                });
            }
        });
    }

    function reloadTable() {
        $('#accessGroupModal,#confirmModal').modal('hide');

        dataTable.clear();
        dataTable.ajax.reload();
        dataTable.draw();
    }

    $('#accessGroupForm :input').change(enableButtons);
    $('#accessGroupForm :input').keyup(enableButtons);

    function enableButtons(event) {
        if (event.keyCode !== 9) {
            $('#btnSaveAccessGroup').prop('disabled', false);
        }
    }

    $('#btnSaveAccessGroup').on('click', function () {
        $('.invalid-feedback').hide();
        $('#accessGroupModal').modal('hide');

        saveClicked = true;
    });

    $('#accessGroupModal').on('hidden.bs.modal', function () {
        if (saveClicked) {
            saveAccessGroup();
            saveClicked = false;
        }
    });

    function saveAccessGroup() {
        let rowData = dataTable.row({ selected: true }).data();

        let data = JSON.stringify({
            guid: (rowData && rowData['guid']) || null,
            name: $('#name').val()
        });
        $.ajax($('form').prop('action'), {
            method: 'POST',
            contentType: 'application/json',
            data: data
        }).then(reloadTable, function (result) {
            $('#accessGroupModal').modal('show');

            if (result.statusText !== undefined && result.statusText !== null) {
 
                let errors = result.errors || [];
                let msg = result.statusText || null;
                for (let field in errors) {
                    $(`#${field} ~ .invalid-feedback`).show().html(errors[field].map(x => x.errorMessage).join('<br/>')).html(field);
                }
                if (msg) {
                    $('#accessGroupModal .alert').show().text(msg);
                };
            }
        });
    }

    $('#btnConfirmDeleteAccessGroup').on('click', function () {

        let data = JSON.stringify(dataTable.rows({ selected: true }).data().toArray());

        $.ajax('/api/dispatcher/access-groups/delete', {
            method: 'POST',
            contentType: 'application/json',
            data: data,
            error: function (result) {
                if (result.responseJSON !== undefined && result.responseJSON !== null) {
                    let msg = result.statusText || null;
                    let errors = result.responseJSON.errors || [];
                    console.log(errors);
                    console.log(result);
                    if (msg) {
                        msg += "<br /><br />";
                        for (let error in errors) {
                            msg += `Erro em ${error}: `;
                            msg += errors[error].map(x => x.errorMessage);
                            msg += "<br/>";
                        }
                        $('#confirmModal').modal('hide');
                        $('#errorText').html(msg);
                        $('#errorModal').modal('show');
                    }
                }
            }
        }).then(reloadTable);
    });
});