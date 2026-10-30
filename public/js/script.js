// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

(() => {
  const starRatings = document.querySelectorAll('.star-rating')
  starRatings.forEach(container => {
    const inputs = container.querySelectorAll('.star-radio')
    const labels = container.querySelectorAll('.star-label')

    const updateSelected = value => {
      labels.forEach(label => {
        const labelValue = Number(label.dataset.value)
        label.classList.toggle('selected', labelValue <= value)
      })
    }

    labels.forEach(label => {
      label.addEventListener('mouseenter', () => {
        const value = Number(label.dataset.value)
        labels.forEach(l => l.classList.toggle('hovered', Number(l.dataset.value) <= value))
      })
      label.addEventListener('mouseleave', () => {
        labels.forEach(l => l.classList.remove('hovered'))
      })
    })

    inputs.forEach(input => {
      input.addEventListener('change', event => {
        updateSelected(Number(event.target.value))
      })
    })
  })
})()