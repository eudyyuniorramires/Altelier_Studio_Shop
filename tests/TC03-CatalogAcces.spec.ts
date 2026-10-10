import {test,expect} from '../fixtures/pages';
import {validUser,vipUser,adminUser} from '../data/testData';

test.describe('TC03-CatalogAcces', () => {

     
    test('Access to catalog page without login', async({catalogoPag})=>{
      
         await catalogoPag.addItemTocart();
          await expect(catalogoPag.itemCard).not.toHaveCount(0);
          await expect(catalogoPag.modalAlert).toBeVisible();

    });

    const validScenarios = [

      {email:validUser.email, password:validUser.password, User:validUser.userName},
    
      {email:vipUser.email, password:vipUser.password, User:vipUser.userName},

      {email:adminUser.email, password:adminUser.password, User:adminUser.userName},

    ]
    


    test('Acces to catalog page with Login', async({catalogoPag,loginPage})=>{
 
        for (const {email, password } of validScenarios){
            await loginPage.login(email,password);
            await catalogoPag.addItemTocart();
            await expect(catalogoPag.itemCard).not.toHaveCount(0);
            await expect(catalogoPag.modalAlert).toBeVisible();
        }

    });


});