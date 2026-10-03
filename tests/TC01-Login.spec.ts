import {test, expect} from  '../fixtures/pages';
import {invalidUser, validUser,lockedUser,UserDoesNotExist,badEmailFormat,emptyPassword,vipUser,adminUser} from '../data/testData';

test.describe('TC01-Login', () => {


    const validScenarios = [

      {email:validUser.email, password:validUser.password, User:validUser.userName},
    
      {email:vipUser.email, password:vipUser.password, User:vipUser.userName},

      {email:adminUser.email, password:adminUser.password, User:adminUser.userName},

    ]




    const invalidScenarios = [

        {email:invalidUser.email, password:invalidUser.password, errorMessage:'La contraseña ingresada es incorrecta.'},

        {email:lockedUser.email, password:lockedUser.password, errorMessage:'Tu cuenta se encuentra bloqueada. Motivo: Cuenta bloqueada por seguridad para pruebas QA tras múltiples intentos fallidos.'},
      
        {email:UserDoesNotExist.email, password:UserDoesNotExist.password, errorMessage:'El correo electrónico no se encuentra registrado.'},

    ]

    const inputScenarios = [

    {email:badEmailFormat.email, password:badEmailFormat.password, errorInput:'Ingresa un correo electrónico válido'},

    {email:emptyPassword.email, password:emptyPassword.password, errorInput:'Ingresa tu contraseña'},

    ]


     for (const {email, password, User } of validScenarios){
        
        test(`Login with valid credentials - ${User}`, async ({loginPage})=>{
            await loginPage.login(email,password);
            await expect( loginPage.userAuth).toContainText(User);
        });
    }


    for (const {email, password, errorMessage } of invalidScenarios){
        
        test(`Login with invalid credentials - ${errorMessage}`, async ({loginPage})=>{
            await loginPage.login(email,password);
            await expect(loginPage.errorMessage).toContainText(errorMessage);
        });
    }

    for (const {email,password, errorInput} of inputScenarios){

        test(`Login with invalid input - ${errorInput}`, async ({loginPage})=>{
            
            await loginPage.login(email,password);
            const error = await loginPage.errorEmail
            .or(loginPage.errorPassword)
            .filter({hasText:errorInput});
            await expect(error).toBeVisible();

        });
    }

    




});

