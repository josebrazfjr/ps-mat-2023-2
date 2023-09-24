import React from 'react'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import myfetch from '../utils/myfetch'
import Waiting from '../components/ui/Waiting'
import Notification from '../components/ui/Notification'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import InputMask from 'react-input-mask'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ptLocale from 'date-fns/locale/pt-BR'
import { parseISO } from 'date-fns'
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function CarForm() {

  const navigate = useNavigate()
  const params = useParams()

  // Valores padrão para os campos do formulário
  const carDefaults = {
    brand: '',
    model: '',
    color: '',
    year_manufacture: '',
    imported: false,
    plates: '',
    selling_date: '',
    selling_price: ''
  }

  const [state, setState] = React.useState({
    car: carDefaults,    
    showWaiting: false,
    notification: {
      show: false,
      severity: 'success',
      message: ''
    },
    openDialog: false,
    isFormModified: false
  })

  const {
    car,
    showWaiting,
    notification,
    openDialog,
    isFormModified
  } = state

  const states = [
    { label: 'Distrito Federal', value: 'DF' },
    { label: 'Espírito Santo', value: 'ES' },
    { label: 'Goiás', value: 'GO' },
    { label: 'Minas Gerais', value: 'MG' },
    { label: 'Paraná', value: 'PR' },
    { label: 'Rio de Janeiro', value: 'RJ' },
    { label: 'São Paulo', value: 'SP' }
  ]

  const maskFormatChars = {
    '9': '[0-9]',
    'a': '[A-Za-z]',
    '*': '[A-Za-z0-9]',
    '_': '[\s0-9]'     // Um espaço em branco ou um dígito
  }

  React.useEffect(() => {
    if(params.id) fetchData()
  }, [])

  async function fetchData() {
    setState({ ...state, showWaiting: true })
    try {
      const result = await myfetch.get(`car/${params.id}`)
      
      result.year_manufacture = parseISO(result.year_manufacture);

      setState({ ...state, showWaiting: false, car: result })
      
    } 
    catch(error) {
      setState({ ...state, 
        showWaiting: false,
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: ' + error.message
        } 
      }) 
    }
  }

  function convertToInteger(value) {
    const intValue = parseInt(value, 10); 
    return isNaN(intValue) ? null : intValue; 
  }

  function handleYearManufactureChange(event) {
    const { name, value } = event.target;
    const intValue = convertToInteger(value); 
    const newCar = { ...car, [name]: intValue };
    setState({
      ...state,
      car: newCar,
      isFormModified: true,
    });
  }

  function handleFieldChange(event) {
    console.log(event)
    const newCar = { ...car }
    newCar[event.target.name] = event.target.value
    
    setState({ 
      ...state, 
      car: newCar,
      isFormModified: true     
    })
  }

  async function handleFormSubmit(event) {
    setState({ ...state, showWaiting: true }) 
    event.preventDefault(false)  
    try {

      let result

      if(car.id) result = await myfetch.put(`car/${car.id}`, car)

      else result = await myfetch.post('car', car)
      
      setState({ ...state, 
        showWaiting: false, 
        notification: {
          show: true,
          severity: 'success',
          message: 'Dados salvos com sucesso.'
        }  
      })  
    }
    catch(error) {
      setState({ ...state, 
        showWaiting: false, 
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: ' + error.message
        } 
      })  
    }
  }

  function handleNotificationClose() {
    const status = notification.severity
    
    setState({...state, notification: { 
      show: false,
      severity: status,
      message: ''
    }})

    if(status === 'success') navigate('..', { relative: 'path' })
  }

  function isDateInvalid(date) {
    if (!date) return false; 
    const currentDate = new Date();
    return date > currentDate; 
  }

  function handleBackButtonClose(event) {
    if(isFormModified) setState({ ...state, openDialog: true })

    else navigate('..', { relative: 'path' })
  }

  function handleDialogClose(answer) {

    setState({ ...state, openDialog: false })

    if(answer) navigate('..', { relative: 'path' })
  }

  return(
    <>

      <ConfirmDialog
        title="Atenção"
        open={openDialog}
        onClose={handleDialogClose}
      >
        Há alterações que ainda não foram salvas. Deseja realmente voltar?
      </ConfirmDialog>

      <Waiting show={showWaiting} />

      <Notification
        show={notification.show}
        severity={notification.severity}
        message={notification.message}
        onClose={handleNotificationClose}
      /> 

      <Typography variant="h1" sx={{ mb: '50px' }}>
        Cadastro de carros
      </Typography>

      <form onSubmit={handleFormSubmit}>

        <Box className="form-fields">
        
          <TextField 
            id="brand"
            name="brand" 
            label="Marca" 
            variant="filled"
            required
            fullWidth
            value={car.brand}
            onChange={handleFieldChange}
            autoFocus
          />

          <TextField 
            id="model"
            name="model" 
            label="Modelo" 
            variant="filled"
            required
            fullWidth
            placeholder="Preto"
            value={car.model}
            onChange={handleFieldChange}
          />

          <TextField 
            id="color"
            name="color" 
            label="Cor" 
            variant="filled"
            required
            fullWidth
            placeholder="Preto"
            value={car.color}
            onChange={handleFieldChange}
          />

          <TextField 
            id="year_manufacture"
            name="year_manufacture" 
            label="Ano" 
            variant="filled"
            required
            fullWidth
            value={car.year_manufacture}
            onChange={handleYearManufactureChange}
          />

          <TextField 
            id="imported"
            name="imported" 
            label="Importado"
            fullWidth
            
          >
          </TextField>

          <TextField 
            id="plates"
            name="plates" 
            label="Placa" 
            variant="filled"
            required
            fullWidth
            value={car.plates}
            onChange={handleFieldChange}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptLocale}>
            <DatePicker
              label="Data de venda"
              value={car.selling_date}
              onChange={ value => 
                handleFieldChange({ target: { name: 'selling_date', value } }) 
              }
              slotProps={{ textField: { variant: 'filled', fullWidth: true } }}
              renderImput={(params) => (
                <TextField {...params} error={isDateInvalid()} />
              )}
              renderDay={(date, _value, DayProps, DayState) => {
                const isDayInvalid = isDateInvalid(date); 
                return (
                  <div
                    {...DayProps}
                    className={clsx(DayProps.className, {
                      [classes.invalidDay]: isDayInvalid, 
                    })}
                  >
                    {date.getDate()}
                  </div>
                );
              }}
            />
          </LocalizationProvider>
          
          <TextField 
            id="selling_price"
            name="selling_price" 
            label="Preço de venda" 
            variant="filled"
            required
            fullWidth
            value={car.selling_price}
            onChange={handleFieldChange}
          />


        </Box>

        <Box sx={{ fontFamily: 'monospace' }}>
          { JSON.stringify(car) }
        </Box>

        <Toolbar sx={{ justifyContent: "space-around" }}>
          <Button 
            variant="contained" 
            color="secondary" 
            type="submit"
          >
            Salvar
          </Button>
          
          <Button 
            variant="outlined"
            onClick={handleBackButtonClose}
          >
            Voltar
          </Button>
        </Toolbar>
      
      </form>
    </>
  )
}