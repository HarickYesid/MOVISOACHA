import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavegacionMapaPage } from './navegacion-mapa.page';

describe('NavegacionMapaPage', () => {
  let component: NavegacionMapaPage;
  let fixture: ComponentFixture<NavegacionMapaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NavegacionMapaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
