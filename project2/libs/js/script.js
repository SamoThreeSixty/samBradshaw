$(function() {
  $('#searchInp').val('')

  $( "#refreshBtn" ).trigger( "click" );
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
        url: 'libs/php/findByName.php',
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
        }, error: function(error) {
          console.log(error)
        }})
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

$('#refreshBtn').on("click", function() {
})

$("#refreshBtn").click(function () {  
  if ($("#personnelBtn").hasClass("active")) {
    // Loads Personnel if selected
    $.ajax({
      url: 'libs/php/getAll.php',
      method: 'GET',
      dataType: "json",
      success: function(result) {       
        if(result.data !== null) {
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
          })
        }
      }
    })
  } else {
    
    if ($("#departmentsBtn").hasClass("active")) {
      // Loads Departments if selected
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
      // Loads Locations if selected
      console.log("location clicked")
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
          console.log(department.name)
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
    url: 'libs/php/addEmployee.php',
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
      console.log(result)

      $('#addPersonnelModal').modal('hide');

      $("#refreshBtn").trigger("click");
    },
    error: function(error){
      console.log(error)
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
    console.log("ok")

    $.ajax({
      url: 'libs/php/deleteEmployee.php',
      type: 'POST',
      dataType: 'json',
      data: {
        id: $('#deletePersonnelEmployeeID').val(),
      },
      success: function(result) {
        console.log(result)

        $('#deletePersonnelModal').modal('hide');

        $("#refreshBtn").trigger("click");
      }
    })
  } else {
    alert("please select yes");
  }
})

