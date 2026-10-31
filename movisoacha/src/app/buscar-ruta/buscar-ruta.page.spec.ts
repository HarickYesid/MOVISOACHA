import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuscarRutaPage } from './buscar-ruta.page';

describe('BuscarRutaPage', () => {
  let component: BuscarRutaPage;
  let fixture: ComponentFixture<BuscarRutaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarRutaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
