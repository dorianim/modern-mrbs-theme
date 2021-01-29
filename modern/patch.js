console.log("Hello :) Path: ", window.location.pathname)

function patchElements(elements, patchFunction) {
    //console.log("Now patching: ", elements)
    if(elements === null)
        return

    var elementCount = elements.length
    var copiedElements = [];
    for (i = 0; i < elementCount; i++) {
        copiedElements.push(elements[i])
    }

    for (var element of copiedElements) {
        //console.log("patching", i, " of", elements.length, ": ", element)
        patchFunction(element)
        //console.log(".. done", element)
    }

    //console.log("--- done ---")
}

function patchFormElement(formElement, depth=0) {
    if(formElement.classList && formElement.classList.contains("none"))
        return

    if (formElement.nodeName === "LABEL") {
        if(formElement.childNodes[0] && (formElement.childNodes[0].type === "checkbox" || formElement.childNodes[0].type === "radio")) {
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
        else if(formElement.type === "radio") {
            formElement.className = "form-check-input"
            formElement.parentElement.className = "form-check"
        }
        else if (formElement.type === "submit")
            formElement.className = "btn btn-primary"
        else
            formElement.className = "form-control"
    else if (formElement.nodeName === "SELECT")
        formElement.className = "form-select"
    else if(formElement.nodeName === "DIV") {
        patchElements(formElement.childNodes, childElement => patchFormElement(childElement, depth + 1))
        formElement.className = "row mr-0"
        formElement.setAttribute("width", "100%")
    }

    if (formElement.id === "create_by")
        formElement.parentElement.className = "none"
    else if (formElement.id === "name")
        formElement.setAttribute("value", mrbs_user.displayName)

    if(depth > 0)
        formElement.outerHTML = `<div class="col-md-6 mb-2">` + formElement.outerHTML + `</div>`
}

function patchMainPage() {
    if (window.location.pathname !== "/index.php" && window.location.pathname !== "/")
        return

    // patch calendar
    var currentDateElement = document.getElementsByClassName("date")[0]
    var currentDate = currentDateElement.innerHTML

    patchElements(document.getElementsByClassName("main_calendar"), element => {
        element.outerHTML = "<div class=\"d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom\">"
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

        element.outerHTML = "<div class=\"btn-group col-auto mr-2 mb-2 mb-md-0\" role=\"group\">" + element.innerHTML + "</div>"
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

        element.outerHTML = "<div class=\"btn-group col-auto col-md-0 mr-2 mb-2 mb-md-0\" role=\"group\">" + element.innerHTML + "</div>"
    })
}

function patchEditEntry() {
    if (window.location.pathname !== "/edit_entry.php")
        return

    var form = document.getElementById("main")
    form.parentElement.className = "container"
    form.className = ""

    // remove byck button
    document.getElementsByName("back_button")[0].outerHTML = ""
    document.getElementById("checks").outerHTML = ""

    patchElements(form.childNodes, fieldset => {
        if (fieldset.nodeName === "FIELDSET") {
            // patch all elements in the fieldset
            patchElements(fieldset.childNodes, formGroup => {
                if (formGroup.nodeName === "DIV") {
                    formGroup.className = "mb-3"
                    patchElements(formGroup.childNodes, formElement => {
                        patchFormElement(formElement)
                    })
                }
            })

            // Make the fieldset collapsable
            var fieldsetNames = {
                "registration": "Registrierung (nur für Kurse)",
                "rep_info": "Serieneinstellungen (nur für Kurse)"
            }

            if (fieldset.id !== "") {
                fieldset.outerHTML = `
                <div class="card mb-4">
                <div class="card-header" id="heading` + fieldset.id + `">
                <h5 class="mb-0">
                  <button class="btn dropdown-toggle" type="button" data-bs-toggle="collapse" data-bs-target="#collapse` + fieldset.id + `" aria-expanded="true" aria-controls="collapse` + fieldset.id + `">
                    ` + fieldsetNames[fieldset.id] + `
                  </button>
                </h5>
              </div>
          
              <div id="collapse` + fieldset.id + `" class="collapse" aria-labelledby="heading` + fieldset.id + `">
                <div class="card card-body">` + fieldset.innerHTML + `</div>
                </div>
              </div></div>`
            }

        }
    })
}

function patchViewEntry() {
    if (window.location.pathname !== "/view_entry.php")
        return

    patchElements(document.getElementsByClassName("contents"), element => element.className = "container")
    document.getElementById("returl").outerHTML = ""

    patchElements(document.getElementById("username"), element => element.parentElement.style = "display: none")

    // patch table
    patchElements(document.getElementsByTagName("table"), table => {
        if(table.id !== "registrants")
        return
        table.className = "table table-bordered table-hover table-striped"
        var rows = table.rows
        for(var row of rows) {
            if(!mrbs_user.isAdmin) {
                row.deleteCell(0)
                row.deleteCell(1)
            }
            else {
                row.deleteCell(2)
            }
        }
    })

    // remove copy button
    patchElements(document.getElementsByName("copy"), element => {
        element.parentElement.parentElement.parentElement.outerHTML = ""
    })

    patchElements(document.getElementsByName("action"), element => {
        if(element.value === "export") {
            element.parentElement.parentElement.parentElement.outerHTML = ""
        }
    })
}

function patchSiteStructure() {

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

    // patch login form
    var loginForm = document.getElementById("logon");
    if (loginForm) {
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
    }

}

// this runs before jquery
patchSiteStructure()
patchMainPage()
patchEditEntry()
patchViewEntry()

feather.replace()