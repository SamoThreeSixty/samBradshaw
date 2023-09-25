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
$("#refreshBtn").trigger("click");
}

clearButton.addEventListener("click", handleButtonClick)
input.addEventListener("input", handleInputChange)


// Functions
const getFilteredDepartments = () => {
  const count = $('#departments').children().length;

  let searchArry = [];
  const childrenArry = $('#departments').children();

  if($('#allDepartmentsSelected').prop("checked")) {
    for(let i = 1; i < count; i++) {
      searchArry.push(childrenArry[i].children[0].value)
    }

    return searchArry;
  }
  
  for(let i = 0; i < count; i++) {
    if(childrenArry[i].children[0].checked) {
      searchArry.push(childrenArry[i].children[0].value)
    } 
  }

  if(count === searchArry.length) {
    return searchArry
  } else {
    return searchArry;
  }
};

const getFilteredLocations = () => {
  const count = $('#locations').children().length;

  let searchArry = [];
  const childrenArry = $('#locations').children();

  if($('#allLocationsSelected').prop("checked")) {
    for(let i = 1; i < count; i++) {
      searchArry.push(childrenArry[i].children[0].value)
    }

    return searchArry;
  }

  for(let i = 0; i < count; i++) {
    if(childrenArry[i].children[0].checked) {
      searchArry.push(childrenArry[i].children[0].value)
    } 
  }

  if(count === searchArry.length) {
    return searchArry
  } else {
    return searchArry;
  }
};


// Setup
$(function() {
  $('#searchInp').val('')
  $("#refreshBtn").trigger("click");
})

// For toggle 
$('.allDepartments').on('click', function() {
  if($('.allDepartments').prop('checked')){
    $('.notAllDepartments').prop('checked', false)
  }
  $("#refreshBtn").trigger("click");
})
$('.notAllDepartments').on('click', function() {
  if($('.allDepartments').prop('checked')){
    $('.allDepartments').prop('checked', false)
  }
  $("#refreshBtn").trigger("click");
})
$('.allLocations').on('click', function() {
  if($('.allLocations').prop('checked')){
    $('.notAllLocations').prop('checked', false)
  }
  $("#refreshBtn").trigger("click");
})
$('.notAllLocations').on('click', function() {
  if($('.allLocations').prop('checked')){
    $('.allLocations').prop('checked', false)
  }
  $("#refreshBtn").trigger("click");
})
$('#orderBy input').on('change', function() {
  $("#refreshBtn").trigger("click");
})

$('.filterDropdown').on('click', function() {
  const expanded = $(this).attr('aria-expanded');
  console.log(expanded)

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
  if($('#sidebar-wrapper').hasClass('hide-sidebar')) {
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
          searchBy: "p." + $('#searchBy').val(),
          searchRequest: `%${$('#searchInp').val()}%`
        },
        success: function(result) {
          $('#employee-table').html(`<tr></tr>`)
          result.data.forEach((employee) => {
            $('#employee-table tr:last').after(`
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
          });
        }
      })
  } else {
    $( "#refreshBtn" ).trigger("click");
  }
  
  
});

// Triggers load when any of the buttons are pressed
$('#personnelBtn').on('click', function() {
  $( "#refreshBtn" ).trigger( "click" );
})

$('#departmentsBtn').on('click', function() {
  $( "#refreshBtn" ).trigger( "click" );
})

$('#locationsBtn').on('click', function() {
  $( "#refreshBtn" ).trigger( "click" );
})

// Refresh Button Function
$('#refreshBtn').on("click", function() { 
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
          const department = getFilteredDepartments();
          const location = getFilteredLocations();

          result.data.forEach((employee) => {
            if(department.includes(employee.department) && location.includes(employee.location)) {
                  $('#employee-table tr:last').after(`
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
                <td class="text-end text-nowrap d-none d-md-table-cell">
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
          })
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

            result.data.forEach((department) => {
              $('#department-table tr:last').after(`
              <tr>
                <td class="align-middle text-nowrap">
                  ${department.name}
                </td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                  ${department.location}
                </td>
                <td class="align-middle text-end text-nowrap pe-2">
                  <div class="btn-group dropstart">
                    <button type="button" class="btn" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <ul class="dropdown-menu" style="max-width: 100px;">
                      <li class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                        <p class="m-0"><i class="fa-solid fa-pencil fa-fw"></i> Edit</p>
                      </li>
                      <li class="dropdown-item" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal" data-id="${department.id}">
                        <p class="m-0"><i class="fa-solid fa-trash fa-fw"></i> Delete</p>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr> 
              `);
            })
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
          
          result.data.forEach((location) => {
            $('#location-table tr:last').after(`
              <tr>
                <td class="align-middle text-nowrap">
                   ${location.name}
                </td>
                <td class="align-middle text-end text-nowrap pe-2">
                  <div class="btn-group dropstart">
                    <button type="button" class="btn" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <ul class="dropdown-menu" style="max-width: 100px;">
                      <li class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${location.id}">
                        <p class="m-0"><i class="fa-solid fa-pencil fa-fw"></i> Edit</p>
                      </li>
                      <li class="dropdown-item m-0" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${location.id}">
                        <p class="m-0"><i class="fa-solid fa-trash fa-fw"></i> Delete</p>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
              `)
            })
          }
        }
      })
      
    }
    
  }
  
});

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

      $("#refreshBtn").trigger("click");
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


// Executes when the form button with type="submit" is clicked
$("#editPersonnelForm").on("submit", function (e) {
  // stop the default browser behviour
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

      $("#refreshBtn").trigger("click");
    }
  })
  
});

$("#deletePersonnelModal").on("show.bs.modal", function (e) {
  $('#deletePersonnelEmployeeID').val($(e.relatedTarget).attr("data-id"))

  $('#exampleRadios2').prop( "checked", true );

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

  if($('#exampleRadios1').is(':checked')){
    $.ajax({
      url: 'libs/php/deleteEmployeeByID.php',
      type: 'POST',
      dataType: 'json',
      data: {
        id: $('#deletePersonnelEmployeeID').val(),
      },
      success: function(result) {
        $('#deletePersonnelModal').modal('hide');

        $("#refreshBtn").trigger("click");
      }
    })
  } else {
    alert("please select yes");
  }
})

