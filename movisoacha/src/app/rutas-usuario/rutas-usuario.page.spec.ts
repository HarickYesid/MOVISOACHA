import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RutasUsuarioPage } from './rutas-usuario.page';

describe('RutasUsuarioPage', () => {
  let component: RutasUsuarioPage;
  let fixture: ComponentFixture<RutasUsuarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RutasUsuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
