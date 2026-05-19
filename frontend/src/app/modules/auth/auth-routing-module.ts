import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignIn } from './pages/sign-in/sign-in';

const routes: Routes = [
  {
    path: 'sign-in',
    component: SignIn
  },
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
