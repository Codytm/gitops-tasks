import hudson.security.FullControlOnceLoggedInAuthorizationStrategy
import hudson.security.HudsonPrivateSecurityRealm
import jenkins.model.Jenkins

def instance = Jenkins.instance
def password = System.getenv("JENKINS_ADMIN_PASSWORD")
if (!password) {
  throw new IllegalStateException("JENKINS_ADMIN_PASSWORD is required")
}

def realm = instance.getSecurityRealm()
if (!(realm instanceof HudsonPrivateSecurityRealm)) {
  realm = new HudsonPrivateSecurityRealm(false)
  instance.setSecurityRealm(realm)
}
if (realm.getUser("admin") == null) {
  realm.createAccount("admin", password)
}

def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.setAllowAnonymousRead(false)
instance.setAuthorizationStrategy(strategy)
instance.save()
