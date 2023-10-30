// Input clear button

const input = document.querySelector(".clear-input")
const clearButton = document.querySelector(".clear-input-button")

const handleInputChange = (e) => {
  if (e.target.value && !input.classList.contains("clear-input--touched")) {
    input.classList.add("clear-input--touched")
  } else if (!e.target.value && input.classList.contains("clear-input--touched")) {
    input.classList.remove("clear-input--touched")
  }
}

const handleButtonClick = (e) => {
  input.value = ''
  input.focus()
  input.classList.remove("clear-input--touched")
  refreshTable();
}

clearButton.addEventListener("click", handleButtonClick)
input.addEventListener("input", handleInputChange)


// Functions

const checkFilter = (filter) => {
  const count = $(`#${filter.toLowerCase()}`).children().length;

  let searchArry = [];
  const childrenArry = $(`#${filter.toLowerCase()}`).children();

  if($(`#all${filter}Selected`).prop("checked")) {
    for(let i = 1; i < count; i++) {
      searchArry.push(childrenArry[i].children[0].value)
    }
    // If all is selected return false to say no filter required
    return false;
  }
  
  for(let i = 0; i < count; i++) {
    if(childrenArry[i].children[0].checked) {
      searchArry.push(childrenArry[i].children[0].value)
    } 
  }

  return searchArry;
}

const refreshTable = () => {
    // Loads Personnel Table if selected
    if ($("#personnelBtn").hasClass("active")) {
      $.ajax({
        url: 'libs/php/getAllPersonnel.php',
        method: 'POST',
        dataType: "json",
        data: {
          orderBy: $('#orderBy input:radio:checked').val(),
        },
        success: function(result) {       
          if(result.data !== null) {
            $('#employee-table').html(`<tr></tr>`)
  
            const department = checkFilter('Departments');
            const location = checkFilter('Locations');
  
            if(!department && !location){
              // Both selected ALL
              result.data.forEach((employee) => {
                insertEmployeeTable(employee)
              })
            } else if (!department && (location !== false)) {
              // Filter locations
              result.data.forEach((employee) => {
                if(location.includes(employee.location)) {
                  insertEmployeeTable(employee);
                }
              })
            } else if ((department !== false) && !location) {
              // Filter departments
              result.data.forEach((employee) => {
                if(department.includes(employee.department)) {
                  insertEmployeeTable(employee);
                }
              })
            } else { 
              // Filter departments and locations
              result.data.forEach((employee) => {
                if(department.includes(employee.department) && location.includes(employee.location)) {
                  insertEmployeeTable(employee);
                }
              })
            }
          }
        }
      })
    } else {
      // Loads Departments Table if selected
      if ($("#departmentsBtn").hasClass("active")) {
        $.ajax({
          url: 'libs/php/getAllDepartments.php',
          method: 'GET',
          dataType: "json",
          success: function(result) {
            if(result.data !== null) {
              $('#department-table').html(`<tr></tr>`)
  
              const department = checkFilter('Departments');
              const location = checkFilter('Locations');
  
              if(!department && !location){
                // Both selected ALL
                result.data.forEach((departments) => {
                  insertDepartmentsTable(departments)
                })
              } else if (!department && (location !== false)) {
                // Filter locations
                result.data.forEach((departments) => {
                  if(location.includes(departments.location)) {
                    insertDepartmentsTable(departments);
                  }
                })
              } else if ((department !== false) && !location) {
                // Filter departments
                result.data.forEach((departments) => {
                  if(department.includes(departments.name)) {
                    insertDepartmentsTable(departments);
                  }
                })
              } else { 
                // Filter departments and locations
                result.data.forEach((departments) => {
                  if(department.includes(departments.name) && location.includes(departments.location)) {
                    insertDepartmentsTable(departments);
                  }
                })
              }
            }
          }
        })      
      } else {
        // Loads Locations Table if selected
        $.ajax({
          url: 'libs/php/getAllLocations.php',
          method: "GET",
          success: function(result) {
            if(result.data !== null) {
              $('#location-table').html('<tr></tr>');
  
              const location = checkFilter('Locations');
              
              if(!location) {
                result.data.forEach((locations) => {
                  insertLocationsTable(locations);
                })
              } else {
                result.data.forEach((locations) => {
                  if(location.includes(locations.name)) {
                    insertLocationsTable(locations);
                  }
                })
              }
            }
          }
        })
      }
    }
}

const insertEmployeeTable = (employee) => {
  return $('#employee-table tr:last').after(`
      <tr>
      <td class="align-middle text-nowrap">
        ${employee.lastName}, ${employee.firstName}
      </td>
      <td class="align-middle text-nowrap d-none d-md-table-cell">
        ${employee.department}
      </td>
      <td class="align-middle text-nowrap d-none d-md-table-cell">
        ${employee.location}
      </td>
      <td class="align-middle text-nowrap d-none d-md-table-cell">
        ${employee.email}
      </td>
      <td class="align-middle text-nowrap d-none d-md-table-cell">
        ${employee.jobTitle}
      </td>
      <td class="align-middle text-end text-nowrap pe-2">
        <div class="btn-group dropstart">
          <button type="button" class="btn" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          <ul class="dropdown-menu" style="max-width: 100px;">
            <li class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${employee.id}">
              <p class="m-0"><i class="fa-solid fa-pencil fa-fw"></i> Edit</p> 
            </li>
            <li class="dropdown-item" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${employee.id}">
              <p class="m-0"><i class="fa-solid fa-trash fa-fw"></i> Delete</p>
            </li>
          </ul>
        </div>
      </td>
    </tr>
  `);
}

const insertDepartmentsTable = (departments) => {
  return $('#department-table tr:last').after(`
    <tr>
      <td class="align-middle text-nowrap">
        ${departments.name}
      </td>
      <td class="align-middle text-nowrap d-none d-md-table-cell">
        ${departments.location}
      </td>
      <td class="align-middle text-end text-nowrap pe-2">
        <div class="btn-group dropstart">
          <button type="button" class="btn" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          <ul class="dropdown-menu" style="max-width: 100px;">
            <li class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${departments.id}">
              <p class="m-0"><i class="fa-solid fa-pencil fa-fw"></i> Edit</p>
            </li>
            <li class="dropdown-item" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal" data-id="${departments.id}">
              <p class="m-0"><i class="fa-solid fa-trash fa-fw"></i> Delete</p>
            </li>
          </ul>
        </div>
      </td>
    </tr> 
  `);
}

const insertLocationsTable = (locations) => {
  $('#location-table tr:last').after(`
    <tr>
      <td class="align-middle text-nowrap">
        ${locations.name}
      </td>
      <td class="align-middle text-end text-nowrap pe-2">
        <div class="btn-group dropstart">
          <button type="button" class="btn" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          <ul class="dropdown-menu" style="max-width: 100px;">
            <li class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${locations.id}">
              <p class="m-0"><i class="fa-solid fa-pencil fa-fw"></i> Edit</p>
            </li>
            <li class="dropdown-item m-0" data-bs-toggle="modal" data-bs-target="#deleteLocationModal" data-id="${locations.id}">
              <p class="m-0"><i class="fa-solid fa-trash fa-fw"></i> Delete</p>
            </li>
          </ul>
        </div>
      </td>
    </tr>
  `)
}

// Setup
$(function() {
  if(document.documentElement.clientWidth >= 1280) {
    $('#sidebar-wrapper').addClass(`show-sidebar-on-load`)
    $('#sidebar-content').removeClass('hidden')
  } else {
    $('#sidebar-wrapper').addClass(`hide-sidebar-on-load`)
    $('#sidebar-content').addClass('hidden')
  }

  // Set up departments toggle options
  $.ajax({
    url: 'libs/php/getAllDepartments.php',
    method: 'GET',
    type: 'json',
    success: function(result) {
      if(result.status.code == 200) {
        result.data.forEach((department) => {
          $('#departments div:last').after(`
            <div class="form-check">
              <input class="form-check-input | notAllDepartments" type="checkbox" value="${department.name}" id="flexCheckDefault">
              <label class="form-check-label" for="flexCheckDefault">
                    ${department.name}
              </label>
            </div>
          `)

        })
      }
    }
  })

  // Set up locations toggle options
  $.ajax({
    url: 'libs/php/getAllLocations.php',
    method: 'GET',
    type: 'json',
    success: function(result) {
      if(result.status.code == 200) {
        result.data.forEach((location) => {
          $('#locations div:last').after(`
            <div class="form-check">
              <input class="form-check-input | notAllLocations" type="checkbox" value="${location.name}" id="flexCheckChecked">
              <label class="form-check-label" for="flexCheckChecked">
                ${location.name}
              </label>
            </div>
          `)

        })
      }
    }
  })

  $('#searchInp').val('')
  refreshTable();
})

// For toggle 
$('.allDepartments').on('click', function() {
  if($('.allDepartments').prop('checked')){
    $('.notAllDepartments').prop('checked', false)
  }
  refreshTable();
})

$(document.body).on('click', '.notAllDepartments', function() {
  if($('.allDepartments').prop('checked')){
    $('.allDepartments').prop('checked', false)
  }
  refreshTable();
})

$('.allLocations').on('click', function() {
  if($('.allLocations').prop('checked')){
    $('.notAllLocations').prop('checked', false)
  }
  refreshTable();
})

$(document.body).on('click', '.notAllLocations', function() {
  if($('.allLocations').prop('checked')){
    $('.allLocations').prop('checked', false)
  }
  refreshTable();
})

$('#orderBy input').on('change', function() {
  refreshTable();
})

$('.filterDropdown').on('click', function() {
  const expanded = $(this).attr('aria-expanded');

  if($(this).prop('id') == 'filterIcon'){
    if(expanded === "true"){
      $(this).find('i:last-child').removeClass('arrowRight')
      $(this).find('i:last-child').addClass('arrowDown')
    } else {
      $(this).find('i:last-child').removeClass('arrowDown')
      $(this).find('i:last-child').addClass('arrowRight')
    }
  } else {
    if(expanded === "true"){
      $(this).find('i').removeClass('arrowRight')
      $(this).find('i').addClass('arrowDown')
    } else {
      $(this).find('i').removeClass('arrowDown')
      $(this).find('i').addClass('arrowRight')
    }
  }
})

$('#menu-toggle').on("click", function() {
  if($('#sidebar-wrapper').hasClass('hide-sidebar-on-load')) {
    $('#sidebar-wrapper').removeClass('hide-sidebar-on-load')
    $('#sidebar-wrapper').addClass("show-sidebar")
    $('#sidebar-content').removeClass('hidden')
  } else if ($('#sidebar-wrapper').hasClass('show-sidebar-on-load')) {
    $('#sidebar-wrapper').removeClass('show-sidebar-on-load')
    $('#sidebar-content').addClass('hidden')
    $('#sidebar-wrapper').removeClass("show-sidebar")
    $('#sidebar-wrapper').addClass('hide-sidebar')
  } else if($('#sidebar-wrapper').hasClass('hide-sidebar')) {
    $('#sidebar-wrapper').removeClass('hide-sidebar')
    $('#sidebar-wrapper').addClass("show-sidebar")
    $('#sidebar-content').removeClass('hidden')
  } else {
    $('#sidebar-content').addClass('hidden')
    $('#sidebar-wrapper').removeClass("show-sidebar")
    $('#sidebar-wrapper').addClass('hide-sidebar')
  }
})

$("#searchInp").on("keyup", function () {
  if($('#searchInp').val() !== null) {
    $.ajax({
        url: 'libs/php/getBySearch.php',
        type: 'json',
        method: 'POST',
        data: {
          searchRequest: `%${$('#searchInp').val()}%`
        },
        success: function(result) {
          $('#employee-table').html(`<tr></tr>`)
          result.data.forEach((employee) => {
            insertEmployeeTable(employee)
          });
        }
      })
  } else {
    refreshTable();
  }
  
  
});

// Triggers load when any of the buttons are pressed
$('#personnelBtn').on('click', function() {
  refreshTable();
  if(document.documentElement.clientWidth <= 1280) {
    $('#sidebar-content').addClass('hidden')
    $('#sidebar-wrapper').removeClass("show-sidebar")
    $('#sidebar-wrapper').addClass('hide-sidebar')
  }
})

$('#departmentsBtn').on('click', function() {
  refreshTable();
  if(document.documentElement.clientWidth <= 1280) {
    $('#sidebar-content').addClass('hidden')
    $('#sidebar-wrapper').removeClass("show-sidebar")
    $('#sidebar-wrapper').addClass('hide-sidebar')
  }
})

$('#locationsBtn').on('click', function() {
  refreshTable();
  if(document.documentElement.clientWidth <= 1280) {
    $('#sidebar-content').addClass('hidden')
    $('#sidebar-wrapper').removeClass("show-sidebar")
    $('#sidebar-wrapper').addClass('hide-sidebar')
  }
})

// Refresh Button Function
$('.refreshBtn').on("click", function() { 
  refreshTable();
});

// Personnel Modals

$("#addPersonnelModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: 'libs/php/getAllDepartments.php',
    type: "POST",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id") // Retrieves the data-id attribute from the calling button
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        $("#addPersonnelDepartment").html('')

        result.data.forEach((department) => {
          $("#addPersonnelDepartment").append(
            $("<option>", {
              value: department.id,
              text: department.name
            })
          );
        })
        
      } else {
        $("#addPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#addPersonnelModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    }
  });
});

$("#addPersonnelForm").on("submit", function (e) {
  e.preventDefault();

  $.ajax({
    url: 'libs/php/insertEmployee.php',
    type: 'POST',
    dataType: 'json',
    data: {
      firstName: $('#addPersonnelFirstName').val(),
      lastName: $('#addPersonnelLastName').val(),
      jobTitle: $('#addPersonnelJobTitle').val(),
      email: $('#addPersonnelEmailAddress').val(),
      departmentID: $('#addPersonnelDepartment').val()
    },
    success: function(result) {
      $('#addPersonnelModal').modal('hide');

      refreshTable();
    }
  })
})

$("#editPersonnelModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: 'libs/php/getPersonnelByID.php',
    type: "POST",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id") // Retrieves the data-id attribute from the calling button
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        // Update the hidden input with the employee id so that
        // it can be referenced when the form is submitted

        $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);
        $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
        $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
        $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
        $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

        $("#editPersonnelDepartment").html("");

        $.each(result.data.department, function () {
          $("#editPersonnelDepartment").append(
            $("<option>", {
              value: this.id,
              text: this.name
            })
          );
        });

        $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);
        
      } else {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    }
  });
});

$("#editPersonnelForm").on("submit", function (e) {
  e.preventDefault();

  $.ajax({
    url: 'libs/php/updateEmployee.php',
    method: 'POST',
    dataType: 'json',
    data: {
      firstName: $('#editPersonnelFirstName').val(),
      lastName: $('#editPersonnelLastName').val(),
      email: $('#editPersonnelEmailAddress').val(),
      jobTitle: $('#editPersonnelJobTitle').val(),
      id: $("#editPersonnelEmployeeID").val()
    },
    success: function(result) {
      $('#editPersonnelModal').modal('hide');

      refreshTable();
    }
  })
});

$("#deletePersonnelModal").on("show.bs.modal", function (e) {
  $('#deletePersonnelEmployeeID').val($(e.relatedTarget).attr("data-id"))

  $.ajax({
    url: 'libs/php/getPersonnelByID.php',
    type: 'POST',
    dataType: 'json',
    data: {
      id: $('#deletePersonnelEmployeeID').val()
    },
    success: function(result) {
      $('#deleteEmployeeName').html(result.data.personnel[0].firstName + " " + result.data.personnel[0].lastName)
    }
  })
})

$('#deletePersonnelForm').on('submit', function(e) {
  e.preventDefault()

  $.ajax({
    url: 'libs/php/deleteEmployeeByID.php',
    type: 'POST',
    dataType: 'json',
    data: {
      id: $('#deletePersonnelEmployeeID').val(),
    },
    success: function(result) {
      $('#deletePersonnelModal').modal('hide');

      refreshTable();
    }
  })
})



// Department Modals
$('#addDepartmentModal').on("show.bs.modal", function() {
  $.ajax({
    url: 'libs/php/getAllLocations.php',
    type: "GET",
    dataType: "json",
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        $("#addDepartmentLocation").html('')

        result.data.forEach((location) => {
          $("#addDepartmentLocation").append(
            $("<option>", {
              value: location.id,
              text: location.name
            })
          );
        })
      }
    }
  })
})

$('#addDepartmentForm').on('submit', function(e) {
  e.preventDefault()

  $.ajax({
    url: 'libs/php/insertDepartment.php',
    type: 'POST',
    dataType: 'json',
    data: {
      name: $('#addDepartmentName').val(),
      locationID: $('#addDepartmentLocation').val()
    },
    success: function () {
      $('#addDepartmentModal').modal('hide');

      refreshTable();
    }
  })
})

$('#editDepartmentModal').on('show.bs.modal', function(e) {
  $('#editDepartmentID').val($(e.relatedTarget).attr("data-id"))
  $.ajax({
    url: 'libs/php/getDepartmentByID.php',
    method: 'POST',
    dataType: 'json',
    data: {
      id: $('#editDepartmentID').val()
    },
    success: function(result) {
      $('#editDepartmentName').val(result.data[0].name)
    }
  })

  $.ajax({
    url: 'libs/php/getAllLocations.php',
    type: "GET",
    dataType: "json",
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        $("#editDepartmentLocation").html('')

        result.data.forEach((location) => {
          $("#editDepartmentLocation").append(
            $("<option>", {
              value: location.id,
              text: location.name
            })
          );
        })

        $.ajax({
          url: 'libs/php/getDepartmentByID.php',
          method: 'POST',
          dataType: 'json',
          data: {
            id: $('#editDepartmentID').val()
          },
          success: function(result) {
            $(`#editDepartmentLocation`).val(result.data[0].locationID).trigger('change');
          }
        })
      }


    }
  })
})

$('#editDepartmentForm').on('submit', function(e) {
  e.preventDefault()

  $.ajax({
    url: 'libs/php/updateDepartment.php',
    type: 'POST',
    dataType: 'json',
    data: {
      name: $('#editDepartmentName').val() ,
      location: $('#editDepartmentLocation').val(),
      id: $('#editDepartmentID').val()
    },
    success: function() {
      $('#editDepartmentModal').modal('hide')

      refreshTable();
    }
  })

})

$('#deleteDepartmentModal').on("show.bs.modal", function(e) {
  $('#deleteDepartmentID').val($(e.relatedTarget).attr("data-id"))

  $('#departmentDependencyList ul').html('');

  $('#deleteDepartmentRadio2').prop( "checked", true );

  $('#departmentDependencyList').collapse('hide')

  $.ajax({
    url: 'libs/php/dependencyCheckPersonnel.php',
    type: 'POST',
    dataType: 'json',
    data: {
      id: $('#deleteDepartmentID').val()
    },
    success: function(result) {
      console.log(result.data[0].name)
      $('#deleteDepartmentName').html(result.data[0].name)

      // only one result, no first name, no last name
      if(!result.data[0].firstName && !result.data[0].lastName && result.data.length == 1) {
        $('#departmentNoDependency').removeClass('d-none');
        $('#deleteDepartmentBtn').removeClass('disabled')
      } else {
        $('#departmentDependency').removeClass('d-none');
        $('#deleteDepartmentBtn').addClass('disabled')

        $('#dependencysAmount').html(`${result.data.length}`)

        result.data.forEach((dependency) => {
          $('#departmentDependencyList ul').append(`<li class="list-group-item">${dependency.firstName + " " + dependency.lastName}</li>`);
        })
      }
    }
  })
})

$('#deleteDepartmentModal').on("hide.bs.modal", function(e) {
  setTimeout(() => {
    $('#departmentDependency').addClass('d-none');
    $('#departmentNoDependency').addClass('d-none');
  }, 500)
  
})

$('#deleteDepartmentForm').on("submit", function(e) {
  e.preventDefault();

  $.ajax({
    url: 'libs/php/deleteDepartmentByID.php',
    type: 'POST',
    dataType: 'json',
    data: {
      id: $('#deleteDepartmentID').val(),
    },
    success: function(result) {
      $('#deleteDepartmentModal').modal('hide');

      refreshTable();
    }
  })
})

// Location Modals
$('#addLocationForm').on('submit', function(e) {
  e.preventDefault()
  
  $.ajax({
    url: 'libs/php/insertLocation.php',
    type: 'POST',
    dataType: 'json',
    data: {
      name: $('#addLocationName').val()
    },
    success: function() {
      $('#addLocationModal').modal('hide')

      refreshTable();
    }
  })
})

$('#editLocationModal').on('show.bs.modal', function(e) {
  $('#editLocationID').val($(e.relatedTarget).attr("data-id"))

  $.ajax({
    url: 'libs/php/getLocationByID.php',
    type: 'POST',
    dataType: 'json',
    data: {
      id: $('#editLocationID').val()
    },
    success: function(result) {
      $('#editLocationName').val(result.data[0].name)
    }
  })
})

$('#editLocationForm').on('submit', function(e) {
  e.preventDefault();

  $.ajax({
    url: 'libs/php/updateLocation.php',
    method: 'POST',
    dataType: 'json',
    data: {
      location: $('#editLocationName').val(),
      id:  $('#editLocationID').val()
    },
    success: function(result) {
      $('#editLocationModal').modal('hide');

      refreshTable();
    }
  })
})

$('#deleteLocationModal').on('show.bs.modal', function(e) {
  $('#deleteLocationID').val($(e.relatedTarget).attr("data-id"))

  $('#locationDependencyList ul').html('');

  $('#locationDependencyList').collapse('hide')

  $.ajax({
    url: 'libs/php/dependencyCheckDepartment.php',
    type: 'POST',
    dataType: 'json',
    data: {
      id: $('#deleteLocationID').val()
    },
    success: function(result) {
      $('#deleteLocationName').html(result.data[0].name)
      console.log(result.data[0].name)
      // only one result, no department name
      if(!result.data[0].department && result.data.length == 1) {
        $('#locationNoDependency').removeClass('d-none');
        $('#deleteLocationBtn').removeClass('disabled');
      } else {
        $('#locationDependency').removeClass('d-none');
        $('#deleteLocationBtn').addClass('disabled')

        $('#locationDependencysAmount').html(`${result.data.length}`)

        result.data.forEach((dependency) => {
          $('#locationDependencyList ul').append(`<li class="list-group-item">${dependency.department}</li>`);
        })
      }
    }
  })
})

$('#deleteLocationModal').on("hide.bs.modal", function(e) {
  setTimeout(() => {
    $('#locationDependency').addClass('d-none');
    $('#locationNoDependency').addClass('d-none');
  }, 500)
})

$('#deleteLocationForm').on("submit", function(e) {
  e.preventDefault();

  $.ajax({
    url: 'libs/php/deleteLocationByID.php',
    type: 'POST',
    dataType: 'json',
    data: {
      id: $('#deleteLocationID').val(),
    },
    success: function(result) {
      $('#deleteLocationModal').modal('hide');

      refreshTable();
    }
  })

})