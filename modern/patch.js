console.log("Hello :) Path: ", window.location.pathname)

function patchElements(elements, patchFunction) {
    if (elements === null)
        return

    var elementCount = elements.length
    var copiedElements = [];
    for (i = 0; i < elementCount; i++) {
        copiedElements.push(elements[i])
    }

    for (var element of copiedElements) {
        patchFunction(element)
    }
}

function patchChildsByTagName(rootElement, tagName, patchFunction, recursive = true) {
    if (!rootElement.childNodes.length > 0)
        return null

    patchElements(rootElement.childNodes, childNode => {
        if (childNode.nodeName === tagName.toUpperCase())
            patchFunction(childNode)
        else if (recursive) {
            patchChildsByTagName(childNode, tagName, patchFunction, recursive)
        }
    })

    return null
}

function patchForm(form, onlyCollapseFieldsetsWithId = true, dontCollapseFirstFieldset = false) {
    form.className = ""
    var firstFieldsetIsDone = false;
    patchElements(form.childNodes, fieldset => {
        if (fieldset.nodeName === "FIELDSET") {
            console.log(fieldset)
            patchFormFieldset(fieldset, onlyCollapseFieldsetsWithId, !dontCollapseFirstFieldset || firstFieldsetIsDone, 0)
            if (fieldset.childNodes.length > 2)
                firstFieldsetIsDone = true
        }
    })
}

function patchFormFieldset(fieldset, onlyCollapseFieldsetsWithId = true, collapse = true, depth = 0) {
    var fieldsetName = null
    // patch all elements in the fieldset
    patchElements(fieldset.childNodes, formGroup => {
        if ((formGroup.nodeName === "DIV") && !(formGroup.classList && (formGroup.classList.contains("none") || formGroup.classList.contains("js_none")))) {
            formGroup.className = "mb-3"
            patchElements(formGroup.childNodes, formElement => {
                patchFormElement(formElement)
            })
        }
        else if (formGroup.nodeName === "LEGEND" && !onlyCollapseFieldsetsWithId) {
            patchElements(formGroup.childNodes, childNode => {
                if (childNode.nodeName !== "#text")
                    childNode.outerHTML = ""
            })
            fieldsetName = formGroup.innerHTML
            formGroup.outerHTML = ""
        }
        else if (formGroup.nodeName === "FIELDSET") {
            patchFormFieldset(formGroup, onlyCollapseFieldsetsWithId, true, depth + 1)
        }
    })

    // Make the fieldset collapsable
    var fieldsetNames = {
        "registration": "Registrierung",
        "rep_info": "Serieneinstellungen"
    }

    if (onlyCollapseFieldsetsWithId) {
        fieldsetName = fieldsetNames[fieldset.id]
    }

    if (fieldsetName) {
        if (collapse) {
            var mocId = fieldsetName.replaceAll(" ", "_").replaceAll("(", "").replaceAll(")", "");
            fieldset.outerHTML = `
            <div class="card mb-4">
            <div class="card-header" id="heading` + mocId + `">
            <h5 class="mb-0">
              <button class="btn dropdown-toggle" type="button" data-bs-toggle="collapse" data-bs-target="#collapse` + mocId + `" aria-expanded="true" aria-controls="collapse` + fieldset.id + `">
                ` + fieldsetName + `
              </button>
            </h5>
          </div>

          <div id="collapse` + mocId + `" class="collapse" aria-labelledby="heading` + mocId + `">
            <div class="card card-body">` + fieldset.innerHTML + `</div>
            </div>
          </div></div>`
        }
    }
}

function patchFormElement(formElement, depth = 0) {
    if (formElement.classList && (formElement.classList.contains("none") || formElement.classList.contains("js_none")))
        return

    if (formElement.nodeName === "LABEL") {
        if(formElement.innerHTML.length < 1) {
            formElement.outerHTML = ""
        }
        else if (formElement.childNodes[0] && (formElement.childNodes[0].type === "checkbox" || formElement.childNodes[0].type === "radio")) {
            patchElements(formElement.childNodes, childElement => patchFormElement(childElement))
        }
        else
            formElement.className = "form-label"
    }
    else if (formElement.nodeName === "INPUT" || formElement.nodeName === "TEXTAREA")
        if (formElement.type === "checkbox") {
            formElement.className = "form-check-input"
            formElement.parentElement.className = "form-check form-switch"
        }
        else if (formElement.type === "radio") {
            formElement.className = "form-check-input"
            formElement.parentElement.className = "form-check"
        }
        else if (formElement.type === "submit")
            formElement.className = "btn btn-primary"
        else
            formElement.className = "form-control"
    else if (formElement.nodeName === "SELECT")
        formElement.className = "form-select"
    else if (formElement.nodeName === "DIV") {
        patchElements(formElement.childNodes, childElement => patchFormElement(childElement, depth + 1))
        formElement.className = "row ms-1 mr-0"
        formElement.setAttribute("width", "100%")
    }

    if (formElement.id === "create_by")
        formElement.parentElement.className = "none"

    if (depth > 0) {
        if (formElement.type === "checkbox")
            formElement.outerHTML = `<div class="col-md-1 mb-2 form-check form-switch">` + formElement.outerHTML + `</div>`
        else
            formElement.outerHTML = `<div class="col mb-2">` + formElement.outerHTML + `</div>`
    }
}

function inputToButton(inputElement, innerHTML, extraAttributes = "") {
    if (inputElement.onclick) {
        extraAttributes = `onclick="` + inputElement.onclick.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1] + `" ` + extraAttributes
    }
    return `
    <button type="` + inputElement.type + `" class="` + inputElement.className + `" ` + extraAttributes + ` >
    ` + innerHTML + `
    </button>
    `
}

function patchHeader() {
    for (formId of ["header_goto_date", "header_search", "header_logonoff", "header_user_profile", "header_end_kiosk"]) {
        var form = document.getElementById(formId)
        if (!form)
            continue
        form.className = "d-flex mx-lg-1 mb-2 mb-lg-0"
        patchChildsByTagName(form, "input", element => {
            if (element.type === "search" || element.type === "date") {
                element.className = "form-control mx-auto"
            }
            else if (element.type === "submit" && !element.classList.contains("js_none")) {
                element.className = "btn btn-outline-light mx-auto w-100"
            }
        })
    }
}

function patchLoginPage() {
    if (!document.getElementById("logon"))
        return

    document.getElementById("header_navbar").outerHTML = ""
    document.getElementById("footer").outerHTML = ""
    document.getElementsByTagName("body")[0].style = "display: flex;"

    var loginForm = document.getElementById("logon");
    loginForm.className = "form-signin";

    var formLabels = document.getElementsByTagName("label")

    for (i = 0; i < formLabels.length; i++)
        formLabels[i].className = "visually-hidden"

    var formInputs = document.getElementsByTagName("input")

    for (i = 0; i < formInputs.length; i++)
        if (formInputs[i].type === "submit")
            formInputs[i].className = "w-100 btn btn-lg btn-primary"

    document.getElementById("password").placeholder = "Passwort"

    var headerLabel = document.getElementsByTagName("legend")[0]
    headerLabel.outerHTML = "<h1 class=\"h3 mb-3 fw-normal\">" + headerLabel.innerHTML + "</h1>"

    for (element of loginForm.getElementsByTagName("p")) {
        element.outerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>` + element.innerHTML + `</strong>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`
    }

    loginForm.innerHTML = '<img class="mb-4" src="' + mrbs_company_logo + '" alt="" height="150" >'
        + loginForm.innerHTML
        + '<p class="mt-5 mb-3 text-muted">' + mrbs_company + ' ' + vocab.mrbs + '</p>';
    loginForm.parentElement.className = "form-signin"
}

function patchMainPage() {
    if (window.location.pathname !== "/index.php" && window.location.pathname !== "/")
        return

    console.log("Patching calendar!")

    // patch calendar
    var currentDateElement = document.getElementsByClassName("date")[0]
    if (!currentDateElement)
        return
    var currentDate = currentDateElement.innerHTML

    patchElements(document.getElementsByClassName("main_calendar"), element => {
        element.outerHTML = "<div class=\"d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom\">"
            + "<h2 class=\"h2\" >" + currentDate + "</h1>"
            + "<div class=\"btn-toolbar mb-2 mb-md-0 flex-wrap\" role=\"toolbar\">" + element.innerHTML + "</div></div>"

        //element.outerHTML = "<div class=\"container-fluid\"><div class=\"row\"><h2 class=\"col\" >" + currentDate + "</h1>"  + element.innerHTML + "</div></div>"
    })

    currentDateElement.outerHTML = ""

    // area combobox
    patchElements(document.getElementsByClassName("location"), element => {
        element.parentElement.prepend(element)

        if (element.childNodes.length > 1) {
            var outerHTML = ""
            for (let childNode of element.childNodes) {
                console.log(childNode)
                if (childNode.nodeName == "FORM") {
                    outerHTML += "<div class=\"btn-group col-auto mr-2 mb-2 mb-md-0\" role=\"group\">" + childNode.outerHTML + "</div>"
                }
            }
            element.outerHTML = outerHTML
        }
        else {
            element.outerHTML = "<div class=\"btn-group col-auto mr-2 mb-2 mb-md-0\" role=\"group\">" + element.innerHTML + "</div>"
        }
    })

    patchElements(document.getElementsByClassName("room_area_select"), element => {
        element.className = "w-100 btn btn-sm btn-outline-secondary dropdown-toggle dropdown "
    })

    // day selector 
    patchElements(document.getElementsByClassName("arrow"), element => {
        patchElements(element.childNodes, function (childNode) {
            if (childNode.className === "prev")
                childNode.innerHTML = "<span data-feather=\"chevron-left\"></span>"
            else if (childNode.className === "next")
                childNode.innerHTML = "<span data-feather=\"chevron-right\"></span>"

            childNode.className = "btn btn-sm btn-outline-secondary"
            //element.innerHTML = "<span aria-hidden=\"true\">&laquo;</span>"
        })

        element.outerHTML = "<div class=\"calendar_day_selector btn-group col-auto mr-2 mb-2 mb-md-0\" role=\"group\">" + element.innerHTML + "</div>"
    })

    // view select
    patchElements(document.getElementsByClassName("view"), element => {
        element.innerHTML = element.childNodes[0].innerHTML
        patchElements(element.childNodes, function (childNode) {
            if (childNode.classList.contains("selected"))
                childNode.className = "active"
            else
                childNode.className = ""

            childNode.className += " btn btn-sm btn-outline-secondary"
            //element.innerHTML = "<span aria-hidden=\"true\">&laquo;</span>"
        })

        element.outerHTML = "<div class=\"calendar_view_selector btn-group col-auto col-md-0 mr-2 mb-2 mb-md-0\" role=\"group\">" + element.innerHTML + "</div>"
    })

    // scroll table
    document.getElementsByClassName("table_container")[0].scroll({ top: 500, left: 0 })
}

function patchEditEntry() {
    if (window.location.pathname !== "/edit_entry.php")
        return

    var form = document.getElementById("main")
    form.parentElement.className = "container"

    var nameField = document.getElementById("name")
    if (nameField.getAttribute("value") == "")
        nameField.setAttribute("value", mrbs_user.displayName)

    // remove back button
    document.getElementsByName("back_button")[0].outerHTML = ""
    document.getElementById("checks").outerHTML = ""

    patchForm(form, true)
}

function patchViewEntry() {
    if (window.location.pathname !== "/view_entry.php")
        return

    if (document.getElementById("returl"))
        document.getElementById("returl").outerHTML = ""

    patchElements(document.getElementById("username"), element => element.parentElement.parentElement.style = "display: none")

    // patch table
    patchElements(document.getElementsByTagName("table"), table => {
        if (table.id !== "registrants")
            return
        table.className = "table table-bordered table-hover table-striped"
        var rows = table.rows
        for (var row of rows) {
            if (!mrbs_user.isAdmin) {
                row.deleteCell(0)
                row.deleteCell(1)
            }
            else {
                row.deleteCell(2)
            }
        }
    })

    // add icons to buttons
    console.log("Adding icons to nav buttons")
    var count = 0;
    var viewEntryNav = document.getElementById("view_entry_nav")
    patchElements(viewEntryNav.getElementsByTagName("form"), form => {
        var innerIcon = ""
        var className = ""
        count++;
        console.log(form, count)
        var patchParents = false
        if (form.getAttribute("action").startsWith("edit_entry.php") && count < 3) {
            className = "btn btn-outline-secondary mr-2 mb-2"
            innerIcon = "edit"
            patchParents = true
        }
        else if (form.getAttribute("action").startsWith("edit_entry.php") && count >= 3) {
            className = "btn btn-outline-secondary mr-2 mb-2"
            innerIcon = "copy"
            patchParents = true
        }
        else if (form.getAttribute("action").startsWith("del_entry.php")) {
            className = "btn btn-outline-danger mr-2 mb-2"
            innerIcon = "trash"
            patchParents = true
        }
        else if (form.getAttribute("action") === "registration_handler.php" && form.parentElement.id === "registration") {
            className = "btn btn-outline-success mr-2 mb-2"
            innerIcon = "plus-circle"
        }
        else if (form.getAttribute("action") === "registration_handler.php" && form.parentElement.id !== "registration") {
            className = "btn btn-outline-danger mr-2 mb-2"
            innerIcon = "trash"
        }
        else {
            return
        }

        if (patchParents) {
            form.parentElement.className = "col-sm-6"
            form.parentElement.parentElement.className = "row"
        }

        patchChildsByTagName(form, "input", formInput => {
            if (formInput.type === "submit") {
                formInput.className = className
                formInput.outerHTML = inputToButton(formInput, "<span class=\"mr-2\" data-feather=\"" + innerIcon + "\"></span>" + formInput.value)
            }
        })
    })

    if(auth.only_admins_can_book && !mrbs_user.isAdmin) {
        viewEntryNav.outerHTML = ""
    }

    // make "You are registered for this event" and "This event is full" a nice banner
    var registrationContainer = document.getElementById("registration");
    if(registrationContainer) {
        patchElements(registrationContainer.childNodes, child => {
            if (child.nodeName === "P") {
                child.outerHTML = `
                <div class="alert alert-primary" role="alert">
                    ` + child.innerHTML + `
                </div>`
            }
        })
        console.log("Adding icons to add and remove buttons")
        patchElements(registrationContainer.getElementsByTagName("form"), form => {
            var innerIcon = ""
            var className = ""
            console.log(form, count)
        
            if (form.getAttribute("action") === "registration_handler.php" && form.parentElement.id === "registration") {
                className = "btn btn-outline-success mr-2 mb-2"
                innerIcon = "plus-circle"
            }
            else if (form.getAttribute("action") === "registration_handler.php" && form.parentElement.id !== "registration") {
                className = "btn btn-outline-danger mr-2 mb-2"
                innerIcon = "trash"
            }
            else {
                return
            }
    
            patchChildsByTagName(form, "input", formInput => {
                if (formInput.type === "submit") {
                    formInput.className = className
                    formInput.outerHTML = inputToButton(formInput, "<span class=\"mr-2\" data-feather=\"" + innerIcon + "\"></span>" + formInput.value)
                }
            })
        })
    }

    // delete export buttons
    patchElements(document.getElementsByName("action"), element => {
        if (element.value === "export") {
            element.parentElement.parentElement.outerHTML = ""
        }
    })
}

function patchAdministration() {
    if (window.location.pathname !== "/admin.php" || !document.getElementById("area_form"))
        return

    patchElements(document.getElementsByTagName("form"), form => {
        if (form.classList && form.classList.contains("areaChangeForm")) {
            // move the edit and delet buttons in place and patch them
            patchElements(form.childNodes, fieldset => {
                if (fieldset.nodeName === "FIELDSET")
                    patchElements(fieldset.childNodes, childNode => {
                        console.log(childNode.nodeName)
                        if (childNode.nodeName === "BUTTON") {
                            var innerIcon = ""
                            if (childNode.childNodes[1] && childNode.childNodes[1].src && childNode.childNodes[1].src.includes("edit")) {
                                childNode.className = "btn btn-outline-secondary mr-2 mb-2"
                                innerIcon = "edit"
                            }
                            else {
                                childNode.className = "btn btn-outline-danger mr-2 mb-2"
                                innerIcon = "trash"
                            }

                            childNode.innerHTML = "<span class=\"mr-2\" data-feather=\"" + innerIcon + "\"></span>" + childNode.title
                        }
                    })
            })
        }
        patchForm(form, false)
    })

    var table = document.getElementById("rooms_table")
    if(table) {
        table.className = "table table-bordered table-hover table-striped"
        var rows = table.rows
        for (var row of rows) {
            patchChildsByTagName(row.cells[0], "span", span => span.className = "none")
            patchChildsByTagName(row.cells[1], "div", div => {
                console.log(div.childNodes)
                if (div.innerHTML.length > 10)
                    div.innerHTML = "<span class=\"mr-2\" data-feather=\"check-square\"></span>"
                else
                    div.innerHTML = "<span class=\"mr-2\" data-feather=\"x-square\"></span>"
            })

            patchChildsByTagName(row.cells[6], "input", input => {
                if (input.classList && input.classList.contains("button"))
                    input.outerHTML = input.outerHTML.replaceAll("input", "button")
            })

            patchChildsByTagName(row.cells[6], "button", input => {
                input.src = ""
                input.type = "submit"
                input.className = "btn btn-outline-danger"
                input.innerHTML = "<span class=\"mr-2\" data-feather=\"trash\"></span>" + input.title
            })

            row.cells[6].innerHTML.replaceAll("class=\"button\"", "class=\"btn\"")
        }
    }
}

function patchEditArea() {
    if (window.location.pathname !== "/edit_area.php")
        return

    patchChildsByTagName(document.getElementById("edit_area"), "fieldset", fieldset => {
        fieldset.outerHTML = fieldset.innerHTML
    }, false)

    patchForm(document.getElementById("edit_area"), false, true)

    patchElements(document.getElementsByClassName("btn-outline-dark"), button => {
        // remove back button
        if (button.getAttribute("formaction") === "admin.php")
            button.outerHTML = ""
    })
}

function patchEditRoom() {
    if (window.location.pathname !== "/edit_room.php")
        return

    patchChildsByTagName(document.getElementById("edit_room"), "fieldset", fieldset => {
        fieldset.outerHTML = fieldset.innerHTML
    }, false)

    patchForm(document.getElementById("edit_room"))

    patchElements(document.getElementsByClassName("btn-outline-dark"), button => {
        // remove back button
        if (button.getAttribute("formaction") === "admin.php")
            button.outerHTML = ""
    })
}

function patchImport() {
    if (window.location.pathname !== "/import.php")
        return

    container = document.getElementById("container")
    if(container) {
        firstChild = container.childNodes[1]
        if(firstChild && firstChild.tagName == "P") {
            firstChild.outerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>` + firstChild.innerHTML + `</strong>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`
        }
    }

    patchElements(document.getElementsByTagName("form"), form => {
        if (form.getAttribute("action") == "import.php") {
            patchChildsByTagName(form, "fieldset", fieldset => {
                fieldset.outerHTML = fieldset.innerHTML
            }, false)

            patchForm(form)
        }
    })

    radioButtons = document.getElementsByName("source_type")
    if(radioButtons) {
        patchElements(radioButtons, buton => {
            buton.onchange = function() {
                if(this.checked) {
                    let fieldToHide = ""
                    let fieldToShow = this.value
                    if(fieldToShow == "file") {
                        fieldToHide = "url"
                    }
                    else {
                        fieldToHide = "file"
                    }
                    fieldToHide = document.getElementById("field_" + fieldToHide)
                    fieldToShow = document.getElementById("field_" + fieldToShow)

                    fieldToHide.classList.add("d-none")
                    patchElements(fieldToHide.childNodes, cn => cn.disabled = true)
                    fieldToShow.classList.remove("d-none")
                    patchElements(fieldToShow.childNodes, cn => cn.disabled = false)
                }
            }
            buton.onchange()
        })
    }

    submitButton = document.getElementById("import")
    if(submitButton) {
        submitButton.outerHTML = inputToButton(submitButton, submitButton.value, "name=\"" + submitButton.name + "\" value=\"" + submitButton.value + "\"")
    }
}

function patchReport() {
    if (window.location.pathname !== "/report.php")
        return

    patchChildsByTagName(document.getElementById("report_form"), "fieldset", fieldset => {
        fieldset.outerHTML = fieldset.innerHTML
    }, false)

    patchForm(document.getElementById("report_form"))

    var table = document.getElementById("report_table")
    if (table)
        table.className = "table table-bordered table-hover table-striped"
}

function patchSearch() {
    if (window.location.pathname !== "/search.php")
        return

    patchForm(document.getElementById("search_form"))

    var table = document.getElementById("search_results")
    if (table)
        table.className = "table table-bordered table-hover table-striped"

        var count = 0
    patchElements(document.getElementById("record_nav").getElementsByTagName("form"), form => {
        var innerIcon = ""
        var className = ""
        var placeIconRight = false
        if (count === 0) {
            className = "btn btn-outline-secondary mr-2 mb-2"
            innerIcon = "chevron-left"
        }
        else {
            className = "btn btn-outline-secondary mr-2 mb-2"
            innerIcon = "chevron-right"
            placeIconRight = true
        }

        count++;

        patchElements(form.childNodes, formInput => {
            if (formInput.type === "submit") {
                formInput.className = className
                if(placeIconRight)    
                    formInput.outerHTML = inputToButton(formInput, formInput.value + "<span class=\"ml-2\" data-feather=\"" + innerIcon + "\"></span>")
                else
                    formInput.outerHTML = inputToButton(formInput, "<span class=\"mr-2\" data-feather=\"" + innerIcon + "\"></span>" + formInput.value)
            }
        })
    })
}

function patchEditUsers() {
    if (window.location.pathname !== "/edit_users.php")
        return

    var editUsersForm = document.getElementById("form_edit_users")
    if(editUsersForm) {
        // remove back button
        backButtons = 
        patchElements(document.getElementsByName("back_button"), backButton => {
            backButton.outerHTML = ""
        })

        console.log("Found edit user form!")
        editUsersForm.className = ""

        patchForm(editUsersForm, true)

        var update_button = document.getElementById("update_button")
        update_button.outerHTML = inputToButton(update_button, update_button.value, "name=\"" + update_button.name + "\" value=\"" + update_button.value + "\"")
        
        patchElements(document.getElementsByName("delete_button"), deleteButton => {
            deleteButton.outerHTML = inputToButton(
                deleteButton, 
                deleteButton.value, 
                "name=\"" + deleteButton.name + "\" value=\"" + deleteButton.value + "\""
                )
        })

        patchElements(document.getElementsByClassName("error"), errorMessage => {
            errorMessage.className = "alert alert-danger"
            errorMessage.tagName = "div"
        })
    }

    var addNewUserForm = document.getElementById("add_new_user")
    if(addNewUserForm) {
        console.log("Found add new user form!")
        patchForm(addNewUserForm)

        var table = document.getElementById("users_table")
        if (table)
            table.className = "table table-bordered table-hover table-striped"
    }

    var userListTable = document.getElementById("users_table")
    if (userListTable) {
        if(!mrbs_user.isAdmin) {
            window.location.replace("/")
        }
        else {
            patchElements(userListTable.getElementsByTagName("form"), form => {
                patchElements(form.getElementsByTagName("input"), input => {
                    console.log(input)
                    if (input.type == "submit") {
                        form.innerHTML += "<input type=\"hidden\" name=\"edit_button\" value=\"" + input.value + "\">"
                    }
                })
            })
        }
    }
}

function patchResetPassword() {
    if (window.location.pathname !== "/reset_password.php")
        return

    var form = document.getElementById("lost_password")
    if(form)
        patchForm(form, true)
}

function patchDel() {
    if(window.location.pathname !== "/del.php")
        return

    console.log("Adding icons to add and remove buttons")
    container = document.getElementById("del_room_confirm")
    patchElements(container.getElementsByTagName("form"), form => {
        var innerIcon = ""
        var className = ""
        console.log(form)
    
        if (form.getAttribute("action") === "admin.php") {
            className = "btn btn-outline-success mr-2 mb-2"
            innerIcon = "x-circle"
        }
        else if (form.getAttribute("action") === "del.php") {
            className = "btn btn-outline-danger mr-2 mb-2"
            innerIcon = "trash"
        }
        else {
            return
        }

        patchChildsByTagName(form, "input", formInput => {
            if (formInput.type === "submit") {
                formInput.className = className
                formInput.outerHTML = inputToButton(formInput, "<span class=\"mr-2\" data-feather=\"" + innerIcon + "\"></span>" + formInput.value)
            }
        })
    })
}

function patchKiosk() {
    if(window.location.pathname === "/kiosk.php") {
        var enter_form = document.getElementById("kiosk_enter")
        if (enter_form) {
            enter_form.innerHTML += "<input type=\"hidden\" name=\"enter_button\" value=\"Starten\" />"
            patchForm(enter_form, false)
        }

        var exit_form = document.getElementById("kiosk_exit")
        if (exit_form) {
            exit_form.innerHTML += "<input type=\"hidden\" name=\"exit_button\" value=\"Verlassen\" />"
            patchForm(exit_form)
        }

        patchElements(document.getElementsByName("back_button"), element => {
            element.parentElement.outerHTML = ""
        })
    }
    else if(window.location.pathname === "/index.php" && (new URLSearchParams(window.location.search)).get("kiosk")) {
        patchElements(document.getElementsByClassName("calendar_day_selector"), element => {
            element.outerHTML = ""
        })

        patchElements(document.getElementsByClassName("calendar_view_selector"), element => {
            element.outerHTML = ""
        })
    }
}

function patchSiteStructure() {
    if(window.location.search.indexOf("nopatch=true") >= 0) {
        console.log("NOT PATCHING!")
        return;
    }

    // general patch of standard elements
    var buttons = document.getElementsByTagName('input'),
        len = buttons !== null ? buttons.length : 0,
        i = 0;

    for (i; i < len; i++) {
        if (buttons[i].type === "submit")
            if (buttons[i].classList.contains("default_action"))
                buttons[i].className += " btn btn-outline-primary";
            else if (buttons[i].parentElement.parentElement.classList.contains("navbar-nav"))
                buttons[i].className += " btn btn-outline-light";
            else
                buttons[i].className += " btn btn-outline-dark";
        else if (buttons[i].type === "text" || buttons[i].type === "password") {
            buttons[i].className += " form-control"
            buttons[i].parentElement.className = "form-group"
        }
    }

    patchLoginPage()
    patchMainPage()
    patchEditEntry()
    patchViewEntry()
    patchAdministration()
    patchEditArea()
    patchEditRoom()
    patchImport()
    patchReport()
    patchSearch()
    patchHeader()
    patchEditUsers()
    patchResetPassword()
    patchDel()
    patchKiosk()

    var forms = document.getElementsByTagName('form')

    for (const form of forms) {
        var formInputs = form.getElementsByTagName("input");
        for (const button of formInputs) {
            if (button.type === "submit") {
                form.addEventListener("submit", () => {
                    button.outerHTML = `
                    <button type="submit" class="` + button.className + `" disabled>
                    ` + button.value + `
                    <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
                    </button>
                    `
                })
            }
        }

        var formButtons = form.getElementsByTagName("button");
        for (const button of formButtons) {
            if (button.type === "submit") {
                form.addEventListener("submit", e => {
                    button.innerHTML += ' <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>'
                    
                    if (!button.value)
                        button.disabled = true
                })
            }
        }

        var formInputs = form.getElementsByTagName("input")
        for (const input of formInputs) {
            form.addEventListener("submit", () => {
                input.readonly = true
            })
        }
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/mrbs-modern-pwa-serviceWorker.js')
        .then(() => { console.log('Service Worker Registered'); });
}

patchSiteStructure()
feather.replace()