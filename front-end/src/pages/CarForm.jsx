import React from 'react'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
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

export default function CarForm() {

  const navigate = useNavigate()
  const params = useParams()

  // Valores padrão para os campos do formulário
  const carDefaults = {
    brand: '',
    model: '',
    //birth_date: '',
    color: '',
    year_manufacture: '',
    Imported: '',
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

  // useEffect com vetor de dependências vazio. Será executado
  // uma vez, quando o componente for carregado
  React.useEffect(() => {
    // Verifica se existe o parâmetro id na rota.
    // Caso exista, chama a função fetchData() para carregar
    // os dados indicados pelo parâmetro para edição
    if(params.id) fetchData()
  }, [])

  async function fetchData() {
    // Exibe o backdrop para indicar que uma operação está ocorrendo
    // em segundo plano
    setState({ ...state, showWaiting: true })
    try {
      const result = await myfetch.get(`car/${params.id}`)
      
      // É necesário converter a data de nascimento de string para data
      // antes de carregá-la no componente DatePicker
      result.birth_date = parseISO(result.birth_date)

      setState({ ...state, showWaiting: false, car: result })
      
    } 
    catch(error) {
      setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: ' + error.message
        } 
      }) 
    }
  }

  function handleFieldChange(event) {
    console.log(event)
    const newCar = { ...car }
    newCar[event.target.name] = event.target.value
    
    setState({ 
      ...state, 
      car: newCar,
      isFormModified: true      // O formulário foi alterado
    })
  }

  async function handleFormSubmit(event) {
    setState({ ...state, showWaiting: true }) // Exibe o backdrop
    event.preventDefault(false)   // Evita o recarregamento da página
    try {

      let result

      // Se existir o campo id no json de dados, chama o método PUT
      // para alteração
      if(car.id) result = await myfetch.put(`car/${car.id}`, car)

      // Senão, chama o método POST para criar um novo registro
      else result = await myfetch.post('car', car)
      
      setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
        notification: {
          show: true,
          severity: 'success',
          message: 'Dados salvos com sucesso.'
        }  
      })  
    }
    catch(error) {
      setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
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
    
    // Fecha a barra de notificação
    setState({...state, notification: { 
      show: false,
      severity: status,
      message: ''
    }})

    // Volta para a página de listagem
    if(status === 'success') navigate('..', { relative: 'path' })
  }

  function handleBackButtonClose(event) {
    // Se o formulário tiver sido modificado, abre a caixa de diálogo
    // para perguntar se quer mesmo voltar, perdendo as alterações
    if(isFormModified) setState({ ...state, openDialog: true })

    // Senão, volta à página de listagem
    else navigate('..', { relative: 'path' })
  }

  function handleDialogClose(answer) {

    // Fechamos a caixa de diálogo
    setState({ ...state, openDialog: false })

    // Se o usuário tiver respondido quer quer voltar à página
    // de listagem mesmo com alterações pendentes, faremos a
    // vontade dele
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

          {/* <InputMask
            mask="999.999.999-99"
            maskChar=" "
            value={car.ident_document}
            onChange={handleFieldChange}
          >
            {
              () =>  */}
              <TextField 
                id="model"
                name="model" 
                label="Modelo" 
                variant="filled"
                required
                fullWidth
              />
            {/*}
          </InputMask>*/}

          <TextField 
            id="color"
            name="color" 
            label="Cor" 
            variant="filled"
            required
            fullWidth
            placeholder="Preto"
            value={car.street_name}
            onChange={handleFieldChange}
          />

          <TextField 
            id="year_manufacture"
            name="year_manufacture" 
            label="Ano" 
            variant="filled"
            required
            fullWidth
            value={car.house_number}
            onChange={handleFieldChange}
          />

          <TextField 
            id="Imported"
            name="Imported" 
            label="Importado" 
            variant="filled"
            fullWidth
            placeholder=""
            value={car.complements}
            onChange={handleFieldChange}
          />

          <TextField 
            id="plates"
            name="plates" 
            label="Placa" 
            variant="filled"
            required
            fullWidth
            value={car.neighborhood}
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



          {/* <TextField
            id="state"
            name="state"
            select
            label="UF"
            variant="filled"
            fullWidth
            required
            value={car.state}
            onChange={handleFieldChange}
          >
            {states.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <InputMask
            mask="(99) _9999-9999"
            formatChars={maskFormatChars}
            maskChar="_"
            value={car.phone}
            onChange={handleFieldChange}
          >
            {
              () => <TextField 
                id="phone"
                name="phone" 
                label="Celular / Telefone de contato" 
                variant="filled"
                required
                fullWidth
                value={car.phone}
                onChange={handleFieldChange}
              />
            }
          </InputMask>

          <TextField 
            id="email"
            name="email" 
            label="E-mail" 
            variant="filled"
            required
            fullWidth
            value={car.email}
            onChange={handleFieldChange}
          />
           */}
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