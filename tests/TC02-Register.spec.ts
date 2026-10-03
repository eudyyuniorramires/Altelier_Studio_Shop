import {test, expect} from '../fixtures/pages';



test.describe('TC02-Register', () => {


    const  validScenarios = [
        {name:'Lucía Méndez', email:`lucia.mendez.qa.${Date.now()}@atelier.com`, password:'NuevaPass123!', address:'Av. Santa Fe 2341', city:'CABA', postal:'C1059', expectedMessage:'Registro exitoso. Sesión iniciada automáticamente.'}
    ]

    const invalidScenarios = [

        {name:'Lucía Méndez', email:`standard_user@atelier.com`, password:'NuevaPass123!', address:'Av. Santa Fe 2341', city:'CABA', postal:'C1059', expectedMessage:'El correo electrónico ya se encuentra registrado.'},
        

    ]

    const invalidInputScenarios = [

        {name:'Lucía Méndez', email:`lucia.mendez.qa.${Date.now()}@atelier.com`, password:'12345', address:'Av. Santa Fe 2341', city:'CABA', postal:'C1059', expectedMessage:'La contraseña debe tener mínimo 6 caracteres'}
    ]
    
    test('Register with valid credentials', async ({registerPage})=>{
         
        for (const {name,email,password,address,city,postal} of validScenarios){
            await registerPage.register(name,email,password,address,city,postal);
            await expect( registerPage.authUser).toContainText(name);
        }
    });
 
    test('Register with invalid credentials', async ({registerPage})=>{
         
        for (const {name,email,password,address,city,postal,expectedMessage} of invalidInputScenarios){
            await registerPage.register(name,email,password,address,city,postal);
            await expect( registerPage.errorInputPassword).toContainText(expectedMessage);
        }
    });

    test('Register with invalid input credentials', async ({registerPage})=>{
         
        for (const {name,email,password,address,city,postal,expectedMessage} of invalidScenarios){
            await registerPage.register(name,email,password,address,city,postal);
            await expect( registerPage.errorMessage).toContainText(expectedMessage);
        }
    });




});


