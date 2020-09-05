namespace App {

    let saveClicked = false;
    let userGuid = null;
    let changePublicCstaProfiles = false;

    $(function () {
        let dataTable = $('#cstaProfiles').DataTable(<any>{
            ajax: {
                url: '/api/csta-profiles',
                dataSrc: ''
            },
            language: { url: '/api/resources/resources.json' },
            dom: "<'row mb-3'<'col'B>>" +
                "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            columns: [
                {
                    data: 'active', searchable: false, render: dataTableRenderBoolean
                },

                { data: 'Alias' },
            ],
            order: [[0, 'desc']],
            select: {
                style: 'single'
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
                    text: function (dt: DataTables.Api) { return dt.i18n('Add', 'Add'); },
                    action: function () {
                        $('form').prop('action', '/api/csta-profiles/add').find('.invalid-feedback, .alert').hide();
                        $('#cstaProfileForm :input').val("");

                        loadProfileExtensions();

                        let label = $('#cstaProfileModalLabel');
                        label.text(label.data('label-add'));
                        $('#cstaProfileModal').modal('show');
                    }
                },
                {
                    enabled: false,
                    text: function (dt: DataTables.Api) { return dt.i18n('Change', 'Change'); },
                    action: function (_, dt: DataTables.Api) {
                        $('form').prop('action', '/api/csta-profiles/update').find('.invalid-feedback, .alert').hide();
                        let record = <any>dt.row({ selected: true }).data();
                       
                        $('#alias').val(record.alias);

                        loadProfileExtensions(record.guid);

                        let label = $('#cstaProfileModalLabel');
                        label.text(label.data('label-change'));

                        $('#cstaProfileModal').modal('show');
                        $('#btnSaveCstaProfile').prop("disabled", true);
                    },
                },
                {
                    enabled: false,
                    text: function (dt: DataTables.Api) { return dt.i18n('Delete', 'Delete'); },
                    action: function () {
                        $('#confirmModal').modal('show');
                    }
                }
            ]
        });

        function loadProfileExtensions(cstaProfileGuid?) {
            let availableProfileExtensions = $('#availableProfileExtensions');
            let selectedProfileExtensions = $('#selectedProfileExtensions');
            availableProfileExtensions.html("");
            selectedProfileExtensions.html("");

            $.ajax('/api/csta-phone-extension', {
                method: 'GET',
                contentType: 'application/json',
                success: function (extensions) {
                    extensions.forEach(function (extension) {
                        let li = "<li data-extension-guid=\"" + extension.guid + "\" id=\"extension_" + extension.guid + "\" class=\"border-bottom\">" + extension.alias + "<i class=\"fas fa-bars float-right mt-3\"></i></li>";
                        availableProfileExtensions.append(li);
                    });
                    (<any>availableProfileExtensions).sortable({
                        group: 'sortProfileExtensions',
                        afterMove: function (placeholder, container) {
                            $('#btnSaveCstaProfile').prop('disabled', false);
                        }
                    });
                       
                    if (cstaProfileGuid) {
                        $.ajax('/api/csta-profile-extensions/' + cstaProfileGuid, {
                            method: 'GET',
                            contentType: 'application/json',
                            success: function (cstaProfileExtensions) {
                                cstaProfileExtensions.forEach(function (item) {
                                    let li = "<li data-profile-extension-guid=\"" + item.guid + "\" id=\"profile_extensions_" + item.guid + "\" class=\"border-bottom\">" + item.alias + "<i class=\"fas fa-bars float-right mt-3\"></i></li>";

                                    availableProfileExtensions.find("[data-profile-extensions-guid='" + item.guid + "']").remove();
                                    selectedProfileExtensions.append(li);
                                });
                                (<any>selectedProfileExtensions).sortable({
                                    group: 'sortProfileExtensions',
                                    afterMove: function (placeholder, container) {
                                        $('#btnSaveCstaProfile').prop('disabled', false);
                                    }
                                });
                            }
                        });
                    } else {
                        (<any>selectedProfileExtensions).sortable({
                            group: 'sortProfileExtensions',
                            afterMove: function (placeholder, container) {
                                $('#btnSaveCstaProfile').prop('disabled', false);
                            }
                        });
                    }
                }
            });
        }    

        function reloadTable() {
            unblockUI();

            $('#cstaProfileModal,#confirmModal').modal('hide');

            dataTable.clear();
            dataTable.ajax.reload();
            dataTable.draw();
        }

        $('#cstaProfileForm').on('change', 'input', enableButtons);
        $('#cstaProfileForm').on('change', 'select', enableButtons);
        $('#cstaProfileForm').on('keyup', 'input', enableButtons);

        function enableButtons(event) {
            if (event.keyCode !== 9) {
                $('#btnSaveCstaProfile').prop('disabled', false);
            }
        }

        $('#btnSaveCstaProfile').on('click', function () {
            $('input:invalid').each(function () {
                let closest = $(this).closest('.tab-pane');
                let tabId = closest.attr('id');

                $('.nav a[href="#' + tabId + '"]').tab('show');

                return false;
            });

            $('.invalid-feedback').hide();
            $('#cstaProfileModal').modal('hide');

            saveClicked = true;
        });


        $('#cstaProfileModal').on('hidden.bs.modal', function () {
            if (saveClicked) {
                blockUI();
                saveCstaProfile();
                saveClicked = false;
            }
        });

        function saveCstaProfile() {
            let rowData = dataTable.row({ selected: true }).data();

            let data = JSON.stringify({
                guid: (rowData && rowData['guid']) || null,
                alias: $('#alias').val()
            });

            $.ajax($('form').prop('action'), {
                method: 'POST',
                contentType: 'application/json',
                data: data
            }).then(reloadTable, function (result) {
                $('#cstaProfileModal').modal('show');
                unblockUI();
                let msg: string | null = result.statusText || null;
                let errors = result.responseJSON.errors || [];
                for (let field in errors) {
                    $(`#${field} ~ .invalid-feedback`).show().html(errors[field].map(x => x.errorMessage).join('<br/>'));
                }

                if (msg) {
                    $('#cstaProfileModal .alert').show().text(msg);
                };
            });
        }

        $('#btnConfirmDeleteCstaProfile').on('click', function () {
            blockUI();

            let data = JSON.stringify(dataTable.rows({ selected: true }).data().toArray());
            $.ajax('/api/csta-profile/delete', {
                method: 'POST',
                contentType: 'application/json',
                data: data,
                error: function (result) {
                    unblockUI();

                    let msg: string | null = result.statusText || null;
                    let errors = result.responseJSON.errors || [];

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
            }).then(reloadTable);
        });
    });
}