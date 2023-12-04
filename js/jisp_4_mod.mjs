export class ModuleScope extends FullScope {
  makeLexNs() {return super.makeLexNs().addMixin(Ns.ownPredecl())}
}

export class Module extends MixOwnValued.goc(MixOwnScoped.goc(a.Emp)) {}

// FIXME: has node list, macroing
export class SrcModule extends Module {
  makeScope() {return new SrcModuleScope()}
}

export class TarModule extends Module {
  makeScope() {return new SynthModuleScope()}
  async macro() {return this}
}
