import React from 'react'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns'
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Link } from 'react-router-dom'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import myfetch from '../utils/myfetch'
import Notification from '../components/ui/Notification'
import Waiting from '../components/ui/Waiting'

export default function CarList() {

  const [state, setState] = React.useState({
    car: {},
    openDialog: false,
    deleteId: null,
    showWaiting: false,
    notification: {
      show: false,
      severity: 'success',
      message: ''
    }
  })

  // Desestruturando as variáveis de estado
  const {
    car,
    openDialog,
    deleteId,
    showWaiting,
    notification
  } = state

  // Este useEffect() será executado apenas uma vez, durante o
  // carregamento da página
  React.useEffect(() => {
    loadData()    // Carrega dos dados do back-end
  }, [])

  async function loadData(afterDeletion = false) {
    // Exibe a tela de espera
    setState({ ...state, showWaiting: true, openDialog: false })
    try {
      const result = await myfetch.get('car')

      let notif = {
        show: false,
        severity: 'success',
        message: ''
      }

      if(afterDeletion) notif = {
        show: true,
        severity: 'success',
        message: 'Exclusão efetuada com sucesso.'
      }

      setState({
        ...state, 
        car: result, 
        showWaiting: false,
        openDialog: false,
        notification: notif
      })
    }
    catch(error) {
      setState({
        ...state,
        showWaiting: false,
        openDialog: false,
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: ' + error.message
        }
      })
      // Exibimos o erro no console
      console.error(error)
    }
  }

  const columns = [
    { field: 'id',
     headerName: 'ID',
      width: 90
    },
    {
      field: 'marca',
      headerName: 'Marca',
      width: 90
    },
    {
      field: 'model',
      headerName: 'Modelo',
      align: 'center',
      headerAlign: 'center',
      width: 150
    },
    {
      field: 'color',
      headerName: 'Cor',
      align: 'center',
      headerAlign: 'center',
      width: 100,
      // valueFormatter: params => {
      //   if(params.value) return format(new Date(params.value), 'dd/MM/yyyy')
      //   else return ''
      // }
    },
    {
      field: 'year_manufacture',
      headerName: 'Ano',
      width: 60,
      // Colocando dois campos na mesma célula
      //valueGetter: params => params.row.municipality + '/' + params.row.state
    },
    {
      field: 'Imported',
      headerName: 'Importado',
      align: 'center',
      headerAlign: 'center',
      width: 90
    },
    {
      field: 'plates',
      headerName: 'Placa',
      width: 100
    },
    {
      field: 'selling_date',
      headerName: 'Data de venda',
      align: 'center',
      headerAlign: 'center',
      width: 130,
      // valueFormatter: params => {
      //   if(params.value) return format(new Date(params.value), 'dd/MM/yyyy')
      //   else return ''
      // }
    },
    {
      field: 'selling_price',
      headerName: 'Preço de venda',
      align: 'center',
      headerAlign: 'center',
      width: 130,
      // valueFormatter: params => {
      //   if(params.value) return format(new Date(params.value), 'dd/MM/yyyy')
      //   else return ''
      // }
    },
    {
      field: 'edit',
      headerName: 'Editar',
      headerAlign: 'center',
      align: 'center',
      width: 90,
      renderCell: params =>
        <Link to={'./' + params.id}>
          <IconButton aria-label="Editar">
            <EditIcon />
          </IconButton>
        </Link> 
    },
    {
      field: 'delete',
      headerName: 'Excluir',
      headerAlign: 'center',
      align: 'center',
      width: 90,
      renderCell: params =>
        <IconButton 
          aria-label="Excluir"
          onClick={() => handleDeleteButtonClick(params.id)}
        >
          <DeleteForeverIcon color="error" />
        </IconButton>
    }
  ];

  function handleDeleteButtonClick(id) {
    setState({ ...state, deleteId: id, openDialog: true })
  }

  async function handleDialogClose(answer) {
    if(answer) {
      // Fecha a caixa de diálogo de confirmação e exibe a tela de espera
      setState({ ...state, openDialog: false, showWaiting: true })
      try {
        // Faz a chamada ao back-end para excluir o cliente
        await myfetch.delete(`car/${deleteId}`)
        
        // Se a exclusão tiver sido feita com sucesso, atualiza a listagem
        loadData(true)
      }
      catch(error) {
        setState({
          ...state,
          showWaiting: false,
          openDialog: false,
          notification: {
            show: true,
            severity: 'error',
            message: 'ERRO: ' + error.message
          }
        })
        console.error(error)
      }
    }
    // Fecha a caixa de diálogo de confirmação
    else setState({ ...state, openDialog: false })
  }

  function handleNotificationClose() {
    setState({...state, notification: { 
      show: false,
      severity: 'success',
      message: ''
    }});
  }
  
  return (
    <>

      <ConfirmDialog
        title="Confirmar operação"
        open={openDialog}
        onClose={handleDialogClose}
      >
        Deseja realmente excluir este item?
      </ConfirmDialog>

      <Waiting show={showWaiting} />

      <Notification
        show={notification.show}
        severity={notification.severity}
        message={notification.message}
        onClose={handleNotificationClose}
      />

      <Typography variant="h1" sx={{ mb: '50px' }}>
        Listagem de carros
      </Typography>

      <Box sx={{
        display: 'flex',
        justifyContent: 'right',
        mb: '25px'  // margin-bottom
      }}>
        <Link to="new">
          <Button 
            variant="contained" 
            color="secondary"
            size="large"
            startIcon={<AddBoxIcon />}
          >
            Cadastrar novo carro
          </Button>
        </Link>
      </Box>

      <Paper elevation={4} sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={car}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Paper>
    </>
  )
}