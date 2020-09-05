import '../js/datatables'
import '../css/users.scss';

//import 'jquery-mask-plugin';
//$('#phoneNumber').mask('(XX)XXXX-XXXX', { translation: { 'X': { pattern: /[0-9]/ } } });
//$('#mobilePhoneNumber').mask('(XX)XXXXX-XXXX', { translation: { 'X': { pattern: /[0-9]/ } } });

let saveClicked = false;
let defaultImage;

$(function () {

    let dataTable = $('#users').DataTable({
        ajax: {
            url: '/api/dispatcher/users',
            dataSrc: ''
        },
        dom: "<'row mb-3'<'col'B>>" +
            "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        columns: [
            { data: 'userName' },
            { data: 'fullName' },
            { data: 'securityAlias' },
            { data: 'accessGroupAlias' }
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
                    $('form').prop('action', '/api/dispatcher/users/add').find('.invalid-feedback, .alert').hide();
                    $('#userForm :input[type != "radio"]').val('');
                    $('#userForm input[type = "checkbox"]').prop('checked', false);
                    $("#profileImage").attr('src', defaultImage);
                    $("#profileImage").data('profileimage', '');

                    $('#userGenderMale').prop('checked', true);
                    $('#userGenderMale').prop('checked', true);

                    toggleProfileImageType('avatar');

                    let avatarPicker = $('.profile-avatar-picker input[name=avatar-picker][value="0"] + img');
                    $('.profile-avatar-picker input[name=avatar-picker][value="0"]').prop('checked', true);
                    $('#avatar-image').prop('src', avatarPicker.prop('src'));


                    $("#profileNone").data('profileNone', '2');
                    $('.profile-none-picker input[name=none-picker][value="2"]').prop('checked', true);

                    loadSecurities();
                    loadAccessGroups();
                    loadCstaProfiles();
                    loadAvatars();

                    let label = $('#userModalLabel');
                    label.text(label.data('label-add'));
                    $('#userModal').modal('show');

                    loadcstaActive();
                    loadTrboNetActive();
                }
            },
            {
                extend: 'selectedSingle',
                text: 'Change',
                action: function (_, dt) {
                    $('form').prop('action', '/api/dispatcher/users/update').find('.invalid-feedback, .alert').hide();
                    let record = dt.row({ selected: true }).data();
                    loadUser(record.guid);
                    loadSecurities(record.securityGuid);
                    loadAccessGroups(record.accessGroupGuid);
                    loadCstaProfiles(record.cstaProfileGuid);

                    let label = $('#userModalLabel');
                    label.text(label.data('label-change'));
                    $('#userModal').modal('show');
                    $('#btnSaveUser').prop("disabled", true);

                    loadcstaActive();
                    loadTrboNetActive();
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

    function loadSecurities(selectedItem) {
        $.ajax('/api/dispatcher/securities', {
            method: 'GET',
            contentType: 'application/json',
            success: function (data) {
                let userSecurities = $('#securityGuid');
                userSecurities.find('option').not(':first').remove();
                data.forEach(function (item) {
                    let selected = selectedItem !== undefined && selectedItem === item.guid;
                    let option = new Option(item.name, item.guid, selected, selected);
                    userSecurities.append(option);
                });
            }
        });
    }

    loadDefaultProfileImage();

    function loadDefaultProfileImage() {
        $.ajax('/api/dispatcher/resources/defaultUserImage', {
            method: 'GET',
            contentType: 'application/json',
            success: function (data) {
                defaultImage = data;
            }
        });
    }

    function loadUser(id) {
        $.ajax('/api/dispatcher/users/' + id, {
            method: 'GET',
            contentType: 'application/json',
            success: function (data) {
                $('#fullName').val(data.fullName);
                $('#userName').val(data.userName);
                $('#password').val(data.password);
                $('#confirmPassword').val(data.password);
                $("#profileImage").attr('src', data.profilePicture ? 'data:image/png;base64,' + data.profilePicture : defaultImage);
                $("#profileImage").data('profileimage', data.profilePicture);
                $('#forcePasswordChange').prop('checked', data.forcePasswordChange);
                $('#blocked').prop('checked', data.blocked);
                $('#userGenderMale').prop('checked', data.gender === "M");
                $('#userGenderFemale').prop('checked', data.gender === "F");
                $('#email').val(data.email);
                $('#integrationUserName').val(data.integrationUserName);
                $('#phoneNumber').val(data.phoneNumber).trigger('input');
                $('#mobilePhoneNumber').val(data.mobilePhoneNumber).trigger('input');
                $('#administrativeAccess').prop('checked', data.administrativeAccess);
                $('#consoleAccess').prop('checked', data.consoleAccess);
                $('#TXRoIPRadarAccess').prop('checked', data.txRoIPRadarAccess);
                $('#webAccess').prop('checked', data.webAccess);
                let avatar = data.avatar || 0;

                loadAvatars();

                let avatarPicker = $('.profile-avatar-picker input[name=avatar-picker][value="' + avatar + '"] + img');
                $('.profile-avatar-picker input[name=avatar-picker][value="' + avatar + '"]').prop('checked', true);
                $('#avatar-image').prop('src', avatarPicker.prop('src'));

                if (data.profileImageType == 'avatar') {
                    $('input[name=profile-image-type][type=radio][value="avatar"]').prop('checked', true);
                    $('input[name=profile-image-type][type=radio][value="photo"]').prop('checked', false);
                    $('input[name=profile-image-type][type=radio][value="none"]').prop('checked', false);
                    $('#profileImage').prop('checked', false);
                } else if (data.profileImageType == 'photo') {
                    $('input[name=profile-image-type][type=radio][value="avatar"]').prop('checked', false);
                    $('input[name=profile-image-type][type=radio][value="photo"]').prop('checked', true);
                    $('input[name=profile-image-type][type=radio][value="none"]').prop('checked', false);
                    $('#profileImage').prop('checked', true);
                } else if (data.profileImageType == 'none') {
                    $('input[name=profile-image-type][type=radio][value="avatar"]').prop('checked', false);
                    $('input[name=profile-image-type][type=radio][value="photo"]').prop('checked', false);
                    $('input[name=profile-image-type][type=radio][value="none"]').prop('checked', true);
                    $('#profileImage').prop('checked', false);
                }

                toggleProfileImageType(data.profileImageType);
            }
        });
    }

    function loadAccessGroups(selectedItem) {
        $.ajax('/api/dispatcher/access-groups', {
            method: 'GET',
            contentType: 'application/json',
            success: function (data) {
                let accessGroups = $('#accessGroupGuid');
                accessGroups.find('option').not(':first').remove();
                data.forEach(function (item) {
                    let selected = selectedItem !== undefined && selectedItem === item.guid;
                    let option = new Option(item.name, item.guid, selected, selected);
                    accessGroups.append(option);
                });
            }
        });
    }

    function loadCstaProfiles(selectedItem) {
        $.ajax('/api/dispatcher/csta-profiles', {
            method: 'GET',
            contentType: 'application/json',
            success: function (data) {
                let UserCstaProfile = $('#cstaProfileGuid');
                UserCstaProfile.find('option').not(':first').remove();
                data.forEach(function (item) {
                    let selected = selectedItem !== undefined && selectedItem === item.guid;
                    let option = new Option(item.alias, item.guid, selected, selected);
                    UserCstaProfile.append(option);
                });
            }
        });
    }

    function reloadTable() {
        $('#userModal,#confirmModal').modal('hide');
        dataTable.clear();
        dataTable.ajax.reload();
        dataTable.draw();
    }

    $('#image-upload').on('change', function (e) {
        uploadImage(e.target).files;
    });

    function uploadImage(file) {
        const fileReader = new FileReader();

        fileReader.onloadend = function () {
            $('#profileImage').attr('src', fileReader.result);
            $('#profileImage').data('profileimage', fileReader.result);
        }
        fileReader.readAsDataURL(file);
    }

    $('#btnConfirmDeleteUser').on('click', function () {
        let records = dataTable.rows({ selected: true }).data();


        deleteUser(records);
    });

    $('#confirm-disconnect-user-button').on('click', function () {
        let records = dataTable.rows({ selected: true }).data();

        var guids = $.map(records, function (data) {
            return data.guid;
        });

        $.ajax('/api/dispatcher/user-sessions/disconnect', {
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(guids),
            success: function (result) {
                $('#confirm-disconnect-user-modal').modal('hide');

                deleteUser(guids);
            }
        });
    });

    function deleteUser() {
        let data = JSON.stringify(dataTable.rows({ selected: true }).data().toArray());

        // JSON.stringify(dataTable.rows({ selected: true }).data().toArray());

        $.ajax('/api/dispatcher/users/delete', {
            method: 'POST',
            contentType: 'application/json',
            data: data,
            error: function (result) {
                if (result.responseJSON !== undefined && result.responseJSON !== null) {
                    switch (result.status) {
                        case 409:
                            showConfirmModal(result);
                            break;
                        default:
                            showErrorMessage(result);
                            break;
                    }
                }
            }

        }).then(reloadTable);
    }
    

    $("input[name='UserGender']").click(function (e) {
        loadAvatars();
    });


    function loadAvatars() {

        $('.profile-avatar-picker').find('img').each(function (index, value) {
            let img = value;
            img.src = img.src.substring(0, img.src.length - 1) + $("input[name='UserGender']:checked").val()
            $("#avatar-image").prop('src', $("input[name='avatar-picker']:checked + img").prop('src'))
        });

    }

    $("input[name='profile-image-type']").click(function (e) {
        toggleProfileImageType($("input[name='profile-image-type']:checked").val());
    });

    function toggleProfileImageType(profileImageType) {
        switch (profileImageType) {
            case "avatar":
                $(".profile-avatar").show();
                $(".profile-photo").hide();
                $(".profile-none").hide();
                break;
            case "photo":
                $(".profile-photo").show();
                $(".profile-avatar").hide();
                $(".profile-none").hide();
                break;
            case "none":
                $(".profile-photo").hide();
                $(".profile-avatar").hide();
                $(".profile-none").show();
                break;
        }
    }

    $("input[name='avatar-picker']").click(function (e) {
        $("#avatar-image").prop('src', $("input[name='avatar-picker']:checked + img").prop('src'))
    });

    function showConfirmModal(result) {
        let msg = result.statusText || null;
        $('#confirmModal').modal('hide');
        $('#confirm-disconnect-user-message').text(msg);
        $('#confirm-disconnect-user-modal').modal('show');
    }

    function showErrorMessage(result) {

        if (result.statusText !== undefined && result.statusText !== null) {
            let errors = result.errors || [];
            let msg = result.statusText || null;

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

    $('#remove-image-button').on('click', function () {
        $("#profileImage").attr('src', defaultImage);
        $("#profileImage").data('profileimage', null);
        $("#image-upload").val('');
        enableButtons(0);
    });


    $('#userForm :input').change(enableButtons);
    $('#userForm :input').keyup(enableButtons);

    function enableButtons(event) {
        if (event.keyCode !== 9) {
            $('#btnSaveUser').prop('disabled', false);
        }
    }

    $('#btnSaveUser').on('click', function () {
        $('.invalid-feedback').hide();
        $('#userModal').modal('hide');
        saveClicked = true;
    });

    $('#userModal').on('hidden.bs.modal', function () {
        $("#image-upload").val('');
        if (saveClicked) {
            saveUser();
            saveClicked = false;
        }
    });

    function saveUser() {
        let profilePicture = $('#profileImage').data('profileimage');
        let rowData = dataTable.row({ selected: true }).data();
        let password = $('#password').val();
        let confirmPassword = $('#confirmPassword').val();
        if (password !== confirmPassword) {
            $('#userPassword_feedback.invalid-feedback').show();
            $('#userModal').modal('show');
            return;
        }
        let securityGuid = $('#securityGuid').val() !== "" ? $('#securityGuid').val() : null;
        let accessGroupGuid = $('#accessGroupGuid').val() !== "empty" ? $('#accessGroupGuid').val() : null;
        let cstaProfileGuid = $('#cstaProfileGuid').val() !== "Selecione" ? $('#cstaProfileGuid').val() : null;
        let data = JSON.stringify({
            guid: (rowData && rowData['guid']) || null,
            fullName: $('#fullName').val(),
            userName: $('#userName').val(),
            password: password,
            forcePasswordChange: $('#forcePasswordChange').prop('checked'),
            profilePicture: profilePicture,
            blocked: $('#blocked').prop('checked'),
            securityGuid: securityGuid || "00000000000000000000000000000000",  //"00000000-0000-0000-0000-000000000000",
            accessGroupGuid: accessGroupGuid,
            cstaProfileGuid: cstaProfileGuid,
            gender: $("input[name='UserGender']:checked").val(),
            email: $('#email').val(),
            integrationUserName: $('#integrationUserName').val(),
            phoneNumber: $('#phoneNumber').val(),
            mobilePhoneNumber: $('#mobilePhoneNumber').val(),
            administrativeAccess: $('#administrativeAccess').prop('checked'),
            consoleAccess: $('#consoleAccess').prop('checked'),
            TXRoIPRadarAccess: $('#TXRoIPRadarAccess').prop('checked'),
            webAccess: $('#webAccess').prop('checked'),
            avatar: $('.profile-avatar-picker input[name=avatar-picker]:checked').val(),
            profileImageType: $('input[name=profile-image-type]:checked').val()

        });

        $.ajax($('form').prop('action'), {
            method: 'POST',
            contentType: 'application/json',
            data: data
        }).then(reloadTable, function (result) {
            $('#userModal').modal('show');

            let errors = result.responseJSON.errors || [];
            let msg = result.statusText || null;
            for (let field in errors) {
                $(`#${field} ~ .invalid-feedback`).show().html(errors[field].map(x => x.errorMessage).join('<br/>'));
            }

            if (msg) {
                $('#userModal .alert').show().text(msg);
            };
        });
    }

    function loadcstaActive() {
        let cstaActiveValue;
        $.ajax('/api/dispatcher/integrations/Csta/Active', {
            method: 'GET',
            contentType: 'application/json',
            success: function (result) {
                if (result.value === undefined || result.value === null) {
                    cstaActiveValue = false;
                } else {
                    cstaActiveValue = result.value === "True";
                }

                if (cstaActiveValue) {
                    $('#profileFields').show();
                } else {
                    $('#profileFields').hide();
                }
            }
        });
    }
    function loadTrboNetActive() {
        let trboNetActive;
        $.ajax('/api/dispatcher/integrations/TrboNet/Active', {
            method: 'GET',
            contentType: 'application/json',
            success: function (result) {
                if (result.value === undefined || result.value === null) {
                    trboNetActive = false;
                } else {
                    trboNetActive = result.value === "True";
                }

                if (trboNetActive) {
                    $('#trboNetFields').show();
                } else {
                    $('#trboNetFields').hide();
                }
            }
        });
    }
});



    //--- Exemplo de obtenção
    //$.ajax('/api/dispatcher/users', {
    //    method: 'GET',
    //    contentType: 'application/json',
    //    success: function (data) {
    //        alert('Users gotten!');
    //    }
    //});

    //$.ajax('/api/dispatcher/avatars', {
    //    method: 'GET',
    //    contentType: 'application/json',
    //    success: function (data) {
    //        alert('Avatars gotten!');
    //    }
    //});

    //$.ajax('/api/dispatcher/users/7fbcb7a2-ab81-4fa4-9593-113fc0c68736', {
    //    method: 'GET',
    //    contentType: 'application/json',
    //    success: function (data) {
    //        alert('User with GUID 7FBCB7A2-AB81-4FA4-9593-113FC0C68736 gotten!');
    //    }
    //});

    //$.ajax('/api/dispatcher/users/current-user-guid', {
    //    method: 'GET',
    //    contentType: 'application/json',
    //    success: function (data) {
    //        alert('Current user GUID gotten!');
    //    }
    //});

    //$.ajax('/api/dispatcher/users/1eace9cb-ddbf-4f65-9c0d-4cbcbafc2740/security-properties/groups/web/properties/ChangeGroupsAndTerminals', {
    //    method: 'GET',
    //    contentType: 'application/json',
    //    success: function (data) {
    //        alert('Security ChangeGroupsAndTerminals of group web of user with GUID 1EACE9CB-DDBF-4F65-9C0D-4CBCBAFC2740 gotten!');
    //    }
    //});

    ////--- Exemplo de exclusão
    //$.ajax('/api/dispatcher/users/delete/[7fbcb7a2-ab81-4fa4-9593-113fc0c68736, d7d50627-48ca-45e0-a181-e58a340d6025]', {
    //    method: 'DELETE',
    //    contentType: 'application/json',
    //    success: function (data) {
    //        alert('Deleted!');
    //    }
    //});

    ////--- Exemplo de alteração
    //$.ajax('/api/dispatcher/users/update', {
    //    method: 'PUT',
    //    contentType: 'application/json',
    //    data: '{"guid": b745c846-21b0-48aa-8674-bd588f4e8933, "name": "CDD Gaspar"}',
    //    success: function (data) {
    //        alert('Updated!');
    //    }
    //});

    ////--- Exemplo de inserção
    //$.ajax('/api/dispatcher/users/add', {
    //    method: 'POST',
    //    contentType: 'application/json',
    //    data: '{"guid": "00000000-0000-0000-0000-000000000000", "name": "Caju - ' + ++i + '"}',
    //    success: function (data) {
    //        alert('Added!');
    //    }
    //});
