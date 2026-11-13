import com.cloudbees.plugins.credentials.CredentialsScope
import com.cloudbees.plugins.credentials.SystemCredentialsProvider
import com.cloudbees.plugins.credentials.domains.Domain
import com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl

def token = System.getenv("GITHUB_TOKEN")
def user = System.getenv("GITHUB_USER")
if (!token || !user) {
  println("GitHub credential was not created because GITHUB_TOKEN or GITHUB_USER is unset")
  return
}

def store = SystemCredentialsProvider.getInstance().getStore()
def existing = store.getCredentials(Domain.global()).find { it.id == "github" }
if (existing == null) {
  store.addCredentials(
    Domain.global(),
    new UsernamePasswordCredentialsImpl(
      CredentialsScope.GLOBAL,
      "github",
      "GitHub credential for gitops-tasks",
      user,
      token,
    ),
  )
  println("Stored GitHub credential for ${user}")
}
