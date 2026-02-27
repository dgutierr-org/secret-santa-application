import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type TranslationKey = 
  | 'common.loading' | 'common.save' | 'common.cancel' | 'common.edit' | 'common.update' | 'common.delete' | 'common.yes' | 'common.no' | 'common.error' | 'common.success' | 'common.welcome' | 'common.logout' | 'common.login' | 'common.signup' | 'common.name' | 'common.photo' | 'common.optional' | 'common.required'
  | 'app.title' | 'app.subtitle'
  | 'auth.signup' | 'auth.logging_in' | 'auth.join_fun' | 'auth.authenticating' | 'auth.connecting_backend'
  | 'profile.setup_title' | 'profile.setup_subtitle' | 'profile.your_name' | 'profile.enter_name' | 'profile.profile_photo' | 'profile.choose_photo' | 'profile.wish_list' | 'profile.wish_list_placeholder' | 'profile.wish_list_help' | 'profile.join_santa' | 'profile.setup_failed' | 'profile.check_connection' | 'profile.waiting_backend' | 'profile.setting_up' | 'profile.uploading_photo' | 'profile.establishing_connection'
  | 'main.welcome_user' | 'main.submission_stage' | 'main.resolution_stage' | 'main.loading_state'
  | 'submission.time_until_deadline' | 'submission.deadline_passed' | 'submission.waiting_admin' | 'submission.current_deadline' | 'submission.ready_resolution' | 'submission.deadline_passed_desc' | 'submission.start_resolution' | 'submission.assigning_santas' | 'submission.need_more_participants' | 'submission.need_two_participants' | 'submission.error_starting' | 'submission.your_profile' | 'submission.participants' | 'submission.participants_count' | 'submission.change_photo' | 'submission.saving' | 'submission.save_changes' | 'submission.no_wish_list' | 'submission.phase_complete' | 'submission.phase_ended' | 'submission.resolution_active' | 'submission.assignments_distributed'
  | 'resolution.your_santa_is' | 'resolution.gifting_to' | 'resolution.wish_list_title' | 'resolution.no_assignment' | 'resolution.no_assignment_desc' | 'resolution.no_wishes' | 'resolution.gift_tips' | 'resolution.gift_tips_desc' | 'resolution.finding_assignment'
  | 'participants.no_participants' | 'participants.hidden_wish_lists' | 'participants.loading_photos' | 'participants.joined' | 'participants.you' | 'participants.people_joined' | 'participants.person_has' | 'participants.people_have'
  | 'countdown.days' | 'countdown.hours' | 'countdown.minutes' | 'countdown.seconds' | 'countdown.deadline'
  | 'admin.dashboard' | 'admin.overview' | 'admin.assignments' | 'admin.system_overview' | 'admin.participants_count' | 'admin.stage' | 'admin.deadline_status' | 'admin.updating' | 'admin.deadline_updated' | 'admin.admin_resolution_control' | 'admin.trigger_resolution' | 'admin.resolution_already_active' | 'admin.reset_round' | 'admin.resetting' | 'admin.resolution_active' | 'admin.secret_santa_assignments' | 'admin.loading_assignments' | 'admin.error_loading_assignments' | 'admin.assignments_only_resolution' | 'admin.all_assignment_pairs' | 'admin.secret_santa' | 'admin.recipient' | 'admin.no_assignments' | 'admin.assignments_after_resolution' | 'admin.assignments_after_begin' | 'admin.pairs_assigned' | 'admin.pair' | 'admin.pairs' | 'admin.admin_trigger_desc' | 'admin.rollback_to_submission' | 'admin.rolling_back' | 'admin.rollback_success' | 'admin.rollback_desc' | 'admin.last_participant' | 'admin.delete_participant' | 'admin.deleting' | 'admin.delete_success' | 'admin.delete_confirm' | 'admin.delete_confirm_desc' | 'admin.cannot_delete_self'
  | 'loading.ho_ho_wait' | 'loading.connecting_backend' | 'loading.loading_profile' | 'loading.checking_permissions'
  | 'footer.built_with_love' | 'footer.caffeine_ai'
  | 'language.select' | 'language.english' | 'language.spanish' | 'language.french';

type Translations = Record<TranslationKey, string>;

const translations: Record<Language, Translations> = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.update': 'Update',
    'common.delete': 'Delete',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.welcome': 'Welcome',
    'common.logout': 'Logout',
    'common.login': 'Login',
    'common.signup': 'Sign up',
    'common.name': 'Name',
    'common.photo': 'Photo',
    'common.optional': 'Optional',
    'common.required': 'Required',
    
    // App Title
    'app.title': 'Secret Santa',
    'app.subtitle': 'Ho ho ho! Ready for some holiday magic?',
    
    // Authentication
    'auth.signup': 'Sign up',
    'auth.logging_in': 'Logging in...',
    'auth.join_fun': 'Join the festive fun!',
    'auth.authenticating': 'Authenticating...',
    'auth.connecting_backend': 'Connecting to backend...',
    
    // Profile Setup
    'profile.setup_title': 'Welcome to Secret Santa!',
    'profile.setup_subtitle': "Let's set up your profile for the gift exchange",
    'profile.your_name': 'Your Name',
    'profile.enter_name': 'Enter your full name',
    'profile.profile_photo': 'Profile Photo (Optional)',
    'profile.choose_photo': 'Choose Photo',
    'profile.wish_list': 'Your Wish List Description',
    'profile.wish_list_placeholder': 'Describe what you\'d like for Christmas... (books, hobbies, favorite colors, etc.)',
    'profile.wish_list_help': 'Share your interests, favorite things, or gift ideas to help your Secret Santa!',
    'profile.join_santa': 'Join the Secret Santa! 🎅',
    'profile.setup_failed': 'Profile Setup Failed',
    'profile.check_connection': 'Please check your connection and try again.',
    'profile.waiting_backend': 'Waiting for Backend Connection...',
    'profile.setting_up': 'Setting up your profile...',
    'profile.uploading_photo': 'Uploading photo...',
    'profile.establishing_connection': 'Establishing backend connection...',
    
    // Main App
    'main.welcome_user': 'Welcome, {name}!',
    'main.submission_stage': 'Submission Stage',
    'main.resolution_stage': 'Resolution Stage',
    'main.loading_state': 'Loading application state...',
    
    // Submission Stage
    'submission.time_until_deadline': 'Time Until Deadline',
    'submission.deadline_passed': 'Deadline Passed!',
    'submission.waiting_admin': 'Waiting for admin to trigger the resolution phase...',
    'submission.current_deadline': 'Current: {date} at {time}',
    'submission.ready_resolution': '🎄 Ready for Resolution!',
    'submission.deadline_passed_desc': 'The deadline has passed! Any participant can now trigger the resolution phase to assign Secret Santas.',
    'submission.start_resolution': 'Start Secret Santa Resolution! 🎅',
    'submission.assigning_santas': 'Assigning Secret Santas...',
    'submission.need_more_participants': 'Need more participants!',
    'submission.need_two_participants': 'At least 2 participants are required to start the resolution phase.',
    'submission.error_starting': 'Error starting resolution:',
    'submission.your_profile': 'Your Profile',
    'submission.participants': 'Participants',
    'submission.participants_count': 'Participants ({count})',
    'submission.change_photo': 'Change Photo',
    'submission.saving': 'Saving...',
    'submission.save_changes': 'Save Changes',
    'submission.no_wish_list': 'No wish list description added yet',
    'submission.phase_complete': 'Submission Phase Complete',
    'submission.phase_ended': 'The submission phase has ended and assignments have been made. Check the resolution section to see your Secret Santa assignment!',
    'submission.resolution_active': 'Resolution Stage Active',
    'submission.assignments_distributed': 'Secret Santa assignments have been distributed! 🎅',
    
    // Resolution Stage
    'resolution.your_santa_is': 'Your Secret Santa is?',
    'resolution.gifting_to': 'Ho ho ho! Here\'s who you\'re gifting to:',
    'resolution.wish_list_title': 'Wish List',
    'resolution.no_assignment': 'No Assignment Yet',
    'resolution.no_assignment_desc': 'The Secret Santa assignments haven\'t been made yet. Please wait for the admin to trigger the resolution phase.',
    'resolution.no_wishes': 'No specific wishes listed - surprise them!',
    'resolution.gift_tips': '🎁 Gift Giving Tips',
    'resolution.gift_tips_desc': 'Remember to keep it a secret until the big reveal! Consider their wish list, but feel free to add your own thoughtful touch. The magic is in the surprise and the joy of giving! 🎅✨',
    'resolution.finding_assignment': 'Finding your Secret Santa assignment...',
    
    // Participants List
    'participants.no_participants': 'No participants yet. Be the first to join!',
    'participants.hidden_wish_lists': 'These are all the participants who have joined so far. Their wish lists will remain hidden until the resolution phase.',
    'participants.loading_photos': 'Loading participant photos...',
    'participants.joined': '✓ Joined',
    'participants.you': 'You',
    'participants.people_joined': '🎄 {count} {people} joined the Secret Santa! The more the merrier! 🎅',
    'participants.person_has': 'person has',
    'participants.people_have': 'people have',
    
    // Countdown Timer
    'countdown.days': 'Days',
    'countdown.hours': 'Hours',
    'countdown.minutes': 'Minutes',
    'countdown.seconds': 'Seconds',
    'countdown.deadline': 'Deadline: {date} at {time}',
    
    // Admin Dashboard
    'admin.dashboard': 'Admin Dashboard',
    'admin.overview': 'Overview',
    'admin.assignments': 'Assignments',
    'admin.system_overview': 'System Overview',
    'admin.participants_count': 'Participants',
    'admin.stage': 'Stage',
    'admin.deadline_status': 'Deadline Status',
    'admin.updating': 'Updating...',
    'admin.deadline_updated': 'Deadline updated successfully!',
    'admin.admin_resolution_control': 'Admin Resolution Control',
    'admin.trigger_resolution': 'Trigger Resolution Now! 🎅',
    'admin.resolution_already_active': 'Resolution Already Active',
    'admin.reset_round': 'Reset Round',
    'admin.resetting': 'Resetting...',
    'admin.resolution_active': 'Resolution stage is active. Assignments have been made!',
    'admin.secret_santa_assignments': 'Secret Santa Assignments',
    'admin.loading_assignments': 'Loading assignments...',
    'admin.error_loading_assignments': 'Error Loading Assignments',
    'admin.assignments_only_resolution': 'Assignments are only available during the resolution stage.',
    'admin.all_assignment_pairs': 'All Secret Santa assignment pairs for this round:',
    'admin.secret_santa': 'Secret Santa',
    'admin.recipient': 'Recipient',
    'admin.no_assignments': 'No assignments yet.',
    'admin.assignments_after_resolution': 'Assignments will be created when resolution is triggered.',
    'admin.assignments_after_begin': 'Assignments will appear here once the resolution phase begins.',
    'admin.pairs_assigned': '🎄 {count} Secret Santa {pairs} assigned! 🎅',
    'admin.pair': 'pair',
    'admin.pairs': 'pairs',
    'admin.admin_trigger_desc': 'As admin, you can trigger resolution at any time regardless of deadline status.',
    'admin.rollback_to_submission': 'Roll Back to Submission',
    'admin.rolling_back': 'Rolling back...',
    'admin.rollback_success': 'Successfully rolled back to submission stage!',
    'admin.rollback_desc': 'Return to submission stage, clearing current assignments while preserving past rounds.',
    'admin.last_participant': 'Last Participant',
    'admin.delete_participant': 'Delete Participant',
    'admin.deleting': 'Deleting...',
    'admin.delete_success': 'Participant deleted successfully!',
    'admin.delete_confirm': 'Delete Participant?',
    'admin.delete_confirm_desc': 'This will permanently remove {name} from the Secret Santa. They will need to sign up again to participate.',
    'admin.cannot_delete_self': 'You cannot delete yourself',
    
    // Loading Messages
    'loading.ho_ho_wait': 'Ho ho ho, please wait...',
    'loading.connecting_backend': 'Establishing backend connection...',
    'loading.loading_profile': 'Loading your profile...',
    'loading.checking_permissions': 'Checking permissions...',
    
    // Footer
    'footer.built_with_love': '© 2025. Built with ❤️ using',
    'footer.caffeine_ai': 'caffeine.ai',
    
    // Language Selector
    'language.select': 'Language',
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
  },
  es: {
    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.update': 'Actualizar',
    'common.delete': 'Eliminar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.welcome': 'Bienvenido',
    'common.logout': 'Cerrar sesión',
    'common.login': 'Iniciar sesión',
    'common.signup': 'Registrarse',
    'common.name': 'Nombre',
    'common.photo': 'Foto',
    'common.optional': 'Opcional',
    'common.required': 'Requerido',
    
    // App Title
    'app.title': 'Amigo Invisible',
    'app.subtitle': '¡Jo jo jo! ¿Listo para un poco de magia navideña?',
    
    // Authentication
    'auth.signup': 'Registrarse',
    'auth.logging_in': 'Iniciando sesión...',
    'auth.join_fun': '¡Únete a la diversión festiva!',
    'auth.authenticating': 'Autenticando...',
    'auth.connecting_backend': 'Conectando al servidor...',
    
    // Profile Setup
    'profile.setup_title': '¡Bienvenido al Amigo Invisible!',
    'profile.setup_subtitle': 'Configuremos tu perfil para el intercambio de regalos',
    'profile.your_name': 'Tu Nombre',
    'profile.enter_name': 'Ingresa tu nombre completo',
    'profile.profile_photo': 'Foto de Perfil (Opcional)',
    'profile.choose_photo': 'Elegir Foto',
    'profile.wish_list': 'Descripción de tu Lista de Deseos',
    'profile.wish_list_placeholder': 'Describe lo que te gustaría para Navidad... (libros, pasatiempos, colores favoritos, etc.)',
    'profile.wish_list_help': '¡Comparte tus intereses, cosas favoritas o ideas de regalos para ayudar a tu Amigo Invisible!',
    'profile.join_santa': '¡Únete al Amigo Invisible! 🎅',
    'profile.setup_failed': 'Error en la Configuración del Perfil',
    'profile.check_connection': 'Por favor verifica tu conexión e intenta de nuevo.',
    'profile.waiting_backend': 'Esperando Conexión del Servidor...',
    'profile.setting_up': 'Configurando tu perfil...',
    'profile.uploading_photo': 'Subiendo foto...',
    'profile.establishing_connection': 'Estableciendo conexión del servidor...',
    
    // Main App
    'main.welcome_user': '¡Bienvenido, {name}!',
    'main.submission_stage': 'Etapa de Envío',
    'main.resolution_stage': 'Etapa de Resolución',
    'main.loading_state': 'Cargando estado de la aplicación...',
    
    // Submission Stage
    'submission.time_until_deadline': 'Tiempo Hasta la Fecha Límite',
    'submission.deadline_passed': '¡Fecha Límite Pasada!',
    'submission.waiting_admin': 'Esperando que el administrador active la fase de resolución...',
    'submission.current_deadline': 'Actual: {date} a las {time}',
    'submission.ready_resolution': '🎄 ¡Listo para la Resolución!',
    'submission.deadline_passed_desc': '¡La fecha límite ha pasado! Cualquier participante puede ahora activar la fase de resolución para asignar Amigos Invisibles.',
    'submission.start_resolution': '¡Iniciar Resolución del Amigo Invisible! 🎅',
    'submission.assigning_santas': 'Asignando Amigos Invisibles...',
    'submission.need_more_participants': '¡Necesitamos más participantes!',
    'submission.need_two_participants': 'Se requieren al menos 2 participantes para iniciar la fase de resolución.',
    'submission.error_starting': 'Error al iniciar la resolución:',
    'submission.your_profile': 'Tu Perfil',
    'submission.participants': 'Participantes',
    'submission.participants_count': 'Participantes ({count})',
    'submission.change_photo': 'Cambiar Foto',
    'submission.saving': 'Guardando...',
    'submission.save_changes': 'Guardar Cambios',
    'submission.no_wish_list': 'Aún no se ha agregado descripción de lista de deseos',
    'submission.phase_complete': 'Fase de Envío Completa',
    'submission.phase_ended': 'La fase de envío ha terminado y se han hecho las asignaciones. ¡Revisa la sección de resolución para ver tu asignación de Amigo Invisible!',
    'submission.resolution_active': 'Etapa de Resolución Activa',
    'submission.assignments_distributed': '¡Las asignaciones del Amigo Invisible han sido distribuidas! 🎅',
    
    // Resolution Stage
    'resolution.your_santa_is': '¿Tu Amigo Invisible es?',
    'resolution.gifting_to': '¡Jo jo jo! Aquí está a quien le vas a dar un regalo:',
    'resolution.wish_list_title': 'Lista de Deseos',
    'resolution.no_assignment': 'Aún Sin Asignación',
    'resolution.no_assignment_desc': 'Las asignaciones del Amigo Invisible aún no se han hecho. Por favor espera a que el administrador active la fase de resolución.',
    'resolution.no_wishes': 'No hay deseos específicos listados - ¡sorpréndelos!',
    'resolution.gift_tips': '🎁 Consejos para Dar Regalos',
    'resolution.gift_tips_desc': '¡Recuerda mantenerlo en secreto hasta la gran revelación! Considera su lista de deseos, pero siéntete libre de agregar tu toque personal. ¡La magia está en la sorpresa y la alegría de dar! 🎅✨',
    'resolution.finding_assignment': 'Encontrando tu asignación de Amigo Invisible...',
    
    // Participants List
    'participants.no_participants': 'Aún no hay participantes. ¡Sé el primero en unirte!',
    'participants.hidden_wish_lists': 'Estos son todos los participantes que se han unido hasta ahora. Sus listas de deseos permanecerán ocultas hasta la fase de resolución.',
    'participants.loading_photos': 'Cargando fotos de participantes...',
    'participants.joined': '✓ Unido',
    'participants.you': 'Tú',
    'participants.people_joined': '🎄 ¡{count} {people} unieron al Amigo Invisible! ¡Mientras más, mejor! 🎅',
    'participants.person_has': 'persona(s) se',
    'participants.people_have': 'persona(s) se',
    
    // Countdown Timer
    'countdown.days': 'Días',
    'countdown.hours': 'Horas',
    'countdown.minutes': 'Minutos',
    'countdown.seconds': 'Segundos',
    'countdown.deadline': 'Fecha límite: {date} a las {time}',
    
    // Admin Dashboard
    'admin.dashboard': 'Panel de Administración',
    'admin.overview': 'Resumen',
    'admin.assignments': 'Asignaciones',
    'admin.system_overview': 'Resumen del Sistema',
    'admin.participants_count': 'Participantes',
    'admin.stage': 'Etapa',
    'admin.deadline_status': 'Estado de la Fecha Límite',
    'admin.updating': 'Actualizando...',
    'admin.deadline_updated': '¡Fecha límite actualizada exitosamente!',
    'admin.admin_resolution_control': 'Control de Resolución del Administrador',
    'admin.trigger_resolution': '¡Activar Resolución Ahora! 🎅',
    'admin.resolution_already_active': 'Resolución Ya Activa',
    'admin.reset_round': 'Reiniciar Ronda',
    'admin.resetting': 'Reiniciando...',
    'admin.resolution_active': '¡La etapa de resolución está activa. Se han hecho las asignaciones!',
    'admin.secret_santa_assignments': 'Asignaciones del Amigo Invisible',
    'admin.loading_assignments': 'Cargando asignaciones...',
    'admin.error_loading_assignments': 'Error Cargando Asignaciones',
    'admin.assignments_only_resolution': 'Las asignaciones solo están disponibles durante la etapa de resolución.',
    'admin.all_assignment_pairs': 'Todos los pares de asignación del Amigo Invisible para esta ronda:',
    'admin.secret_santa': 'Amigo Invisible',
    'admin.recipient': 'Destinatario',
    'admin.no_assignments': 'Aún no hay asignaciones.',
    'admin.assignments_after_resolution': 'Las asignaciones se crearán cuando se active la resolución.',
    'admin.assignments_after_begin': 'Las asignaciones aparecerán aquí una vez que comience la fase de resolución.',
    'admin.pairs_assigned': '🎄 ¡{count} {pairs} de Amigo Invisible asignados! 🎅',
    'admin.pair': 'par',
    'admin.pairs': 'pares',
    'admin.admin_trigger_desc': 'Como administrador, puedes activar la resolución en cualquier momento independientemente del estado de la fecha límite.',
    'admin.rollback_to_submission': 'Volver a Envío',
    'admin.rolling_back': 'Retrocediendo...',
    'admin.rollback_success': '¡Retrocedido exitosamente a la etapa de envío!',
    'admin.rollback_desc': 'Volver a la etapa de envío, borrando las asignaciones actuales mientras se preservan las rondas pasadas.',
    'admin.last_participant': 'Último Participante',
    'admin.delete_participant': 'Eliminar Participante',
    'admin.deleting': 'Eliminando...',
    'admin.delete_success': '¡Participante eliminado exitosamente!',
    'admin.delete_confirm': '¿Eliminar Participante?',
    'admin.delete_confirm_desc': 'Esto eliminará permanentemente a {name} del Amigo Invisible. Necesitarán registrarse nuevamente para participar.',
    'admin.cannot_delete_self': 'No puedes eliminarte a ti mismo',
    
    // Loading Messages
    'loading.ho_ho_wait': 'Jo jo jo, por favor espera...',
    'loading.connecting_backend': 'Estableciendo conexión del servidor...',
    'loading.loading_profile': 'Cargando tu perfil...',
    'loading.checking_permissions': 'Verificando permisos...',
    
    // Footer
    'footer.built_with_love': '© 2025. Hecho con ❤️ usando',
    'footer.caffeine_ai': 'caffeine.ai',
    
    // Language Selector
    'language.select': 'Idioma',
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
  },
  fr: {
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.edit': 'Modifier',
    'common.update': 'Mettre à jour',
    'common.delete': 'Supprimer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.welcome': 'Bienvenue',
    'common.logout': 'Déconnexion',
    'common.login': 'Connexion',
    'common.signup': 'S\'inscrire',
    'common.name': 'Nom',
    'common.photo': 'Photo',
    'common.optional': 'Optionnel',
    'common.required': 'Requis',
    
    // App Title
    'app.title': 'Père Noël Secret',
    'app.subtitle': 'Ho ho ho ! Prêt pour un peu de magie des fêtes ?',
    
    // Authentication
    'auth.signup': 'S\'inscrire',
    'auth.logging_in': 'Connexion en cours...',
    'auth.join_fun': 'Rejoignez l\'amusement festif !',
    'auth.authenticating': 'Authentification...',
    'auth.connecting_backend': 'Connexion au serveur...',
    
    // Profile Setup
    'profile.setup_title': 'Bienvenue au Père Noël Secret !',
    'profile.setup_subtitle': 'Configurons votre profil pour l\'échange de cadeaux',
    'profile.your_name': 'Votre Nom',
    'profile.enter_name': 'Entrez votre nom complet',
    'profile.profile_photo': 'Photo de Profil (Optionnel)',
    'profile.choose_photo': 'Choisir une Photo',
    'profile.wish_list': 'Description de votre Liste de Souhaits',
    'profile.wish_list_placeholder': 'Décrivez ce que vous aimeriez pour Noël... (livres, loisirs, couleurs préférées, etc.)',
    'profile.wish_list_help': 'Partagez vos intérêts, vos choses préférées ou vos idées de cadeaux pour aider votre Père Noël Secret !',
    'profile.join_santa': 'Rejoindre le Père Noël Secret ! 🎅',
    'profile.setup_failed': 'Échec de la Configuration du Profil',
    'profile.check_connection': 'Veuillez vérifier votre connexion et réessayer.',
    'profile.waiting_backend': 'En attente de la Connexion du Serveur...',
    'profile.setting_up': 'Configuration de votre profil...',
    'profile.uploading_photo': 'Téléchargement de la photo...',
    'profile.establishing_connection': 'Établissement de la connexion du serveur...',
    
    // Main App
    'main.welcome_user': 'Bienvenue, {name} !',
    'main.submission_stage': 'Phase de Soumission',
    'main.resolution_stage': 'Phase de Résolution',
    'main.loading_state': 'Chargement de l\'état de l\'application...',
    
    // Submission Stage
    'submission.time_until_deadline': 'Temps Jusqu\'à la Date Limite',
    'submission.deadline_passed': 'Date Limite Dépassée !',
    'submission.waiting_admin': 'En attente que l\'administrateur déclenche la phase de résolution...',
    'submission.current_deadline': 'Actuel : {date} à {time}',
    'submission.ready_resolution': '🎄 Prêt pour la Résolution !',
    'submission.deadline_passed_desc': 'La date limite est dépassée ! N\'importe quel participant peut maintenant déclencher la phase de résolution pour assigner les Pères Noël Secrets.',
    'submission.start_resolution': 'Commencer la Résolution du Père Noël Secret ! 🎅',
    'submission.assigning_santas': 'Attribution des Pères Noël Secrets...',
    'submission.need_more_participants': 'Besoin de plus de participants !',
    'submission.need_two_participants': 'Au moins 2 participants sont requis pour commencer la phase de résolution.',
    'submission.error_starting': 'Erreur lors du démarrage de la résolution :',
    'submission.your_profile': 'Votre Profil',
    'submission.participants': 'Participants',
    'submission.participants_count': 'Participants ({count})',
    'submission.change_photo': 'Changer la Photo',
    'submission.saving': 'Enregistrement...',
    'submission.save_changes': 'Enregistrer les Modifications',
    'submission.no_wish_list': 'Aucune description de liste de souhaits ajoutée encore',
    'submission.phase_complete': 'Phase de Soumission Terminée',
    'submission.phase_ended': 'La phase de soumission est terminée et les attributions ont été faites. Consultez la section résolution pour voir votre attribution de Père Noël Secret !',
    'submission.resolution_active': 'Phase de Résolution Active',
    'submission.assignments_distributed': 'Les attributions du Père Noël Secret ont été distribuées ! 🎅',
    
    // Resolution Stage
    'resolution.your_santa_is': 'Votre Père Noël Secret est ?',
    'resolution.gifting_to': 'Ho ho ho ! Voici à qui vous offrez un cadeau :',
    'resolution.wish_list_title': 'Liste de Souhaits',
    'resolution.no_assignment': 'Pas Encore d\'Attribution',
    'resolution.no_assignment_desc': 'Les attributions du Père Noël Secret n\'ont pas encore été faites. Veuillez attendre que l\'administrateur déclenche la phase de résolution.',
    'resolution.no_wishes': 'Aucun souhait spécifique listé - surprenez-les !',
    'resolution.gift_tips': '🎁 Conseils pour Offrir des Cadeaux',
    'resolution.gift_tips_desc': 'N\'oubliez pas de garder le secret jusqu\'à la grande révélation ! Considérez leur liste de souhaits, mais n\'hésitez pas à ajouter votre touche personnelle. La magie réside dans la surprise et la joie de donner ! 🎅✨',
    'resolution.finding_assignment': 'Recherche de votre attribution de Père Noël Secret...',
    
    // Participants List
    'participants.no_participants': 'Pas encore de participants. Soyez le premier à vous joindre !',
    'participants.hidden_wish_lists': 'Voici tous les participants qui ont rejoint jusqu\'à présent. Leurs listes de souhaits resteront cachées jusqu\'à la phase de résolution.',
    'participants.loading_photos': 'Chargement des photos des participants...',
    'participants.joined': '✓ Rejoint',
    'participants.you': 'Vous',
    'participants.people_joined': '🎄 {count} {people} ont rejoint le Père Noël Secret ! Plus on est de fous, plus on rit ! 🎅',
    'participants.person_has': 'personne a',
    'participants.people_have': 'personnes ont',
    
    // Countdown Timer
    'countdown.days': 'Jours',
    'countdown.hours': 'Heures',
    'countdown.minutes': 'Minutes',
    'countdown.seconds': 'Secondes',
    'countdown.deadline': 'Date limite : {date} à {time}',
    
    // Admin Dashboard
    'admin.dashboard': 'Tableau de Bord Admin',
    'admin.overview': 'Aperçu',
    'admin.assignments': 'Attributions',
    'admin.system_overview': 'Aperçu du Système',
    'admin.participants_count': 'Participants',
    'admin.stage': 'Phase',
    'admin.deadline_status': 'État de la Date Limite',
    'admin.updating': 'Mise à jour...',
    'admin.deadline_updated': 'Date limite mise à jour avec succès !',
    'admin.admin_resolution_control': 'Contrôle de Résolution Admin',
    'admin.trigger_resolution': 'Déclencher la Résolution Maintenant ! 🎅',
    'admin.resolution_already_active': 'Résolution Déjà Active',
    'admin.reset_round': 'Réinitialiser la Manche',
    'admin.resetting': 'Réinitialisation...',
    'admin.resolution_active': 'La phase de résolution est active. Les attributions ont été faites !',
    'admin.secret_santa_assignments': 'Attributions du Père Noël Secret',
    'admin.loading_assignments': 'Chargement des attributions...',
    'admin.error_loading_assignments': 'Erreur de Chargement des Attributions',
    'admin.assignments_only_resolution': 'Les attributions ne sont disponibles que pendant la phase de résolution.',
    'admin.all_assignment_pairs': 'Toutes les paires d\'attribution du Père Noël Secret pour cette manche :',
    'admin.secret_santa': 'Père Noël Secret',
    'admin.recipient': 'Destinataire',
    'admin.no_assignments': 'Pas encore d\'attributions.',
    'admin.assignments_after_resolution': 'Les attributions seront créées quand la résolution sera déclenchée.',
    'admin.assignments_after_begin': 'Les attributions apparaîtront ici une fois que la phase de résolution commencera.',
    'admin.pairs_assigned': '🎄 {count} {pairs} de Père Noël Secret attribués ! 🎅',
    'admin.pair': 'paire',
    'admin.pairs': 'paires',
    'admin.admin_trigger_desc': 'En tant qu\'administrateur, vous pouvez déclencher la résolution à tout moment indépendamment de l\'état de la date limite.',
    'admin.rollback_to_submission': 'Retour à la Soumission',
    'admin.rolling_back': 'Retour en arrière...',
    'admin.rollback_success': 'Retour réussi à la phase de soumission !',
    'admin.rollback_desc': 'Retourner à la phase de soumission, en effaçant les attributions actuelles tout en préservant les manches passées.',
    'admin.last_participant': 'Dernier Participant',
    'admin.delete_participant': 'Supprimer le Participant',
    'admin.deleting': 'Suppression...',
    'admin.delete_success': 'Participant supprimé avec succès !',
    'admin.delete_confirm': 'Supprimer le Participant ?',
    'admin.delete_confirm_desc': 'Cela supprimera définitivement {name} du Père Noël Secret. Ils devront s\'inscrire à nouveau pour participer.',
    'admin.cannot_delete_self': 'Vous ne pouvez pas vous supprimer vous-même',
    
    // Loading Messages
    'loading.ho_ho_wait': 'Ho ho ho, veuillez patienter...',
    'loading.connecting_backend': 'Établissement de la connexion du serveur...',
    'loading.loading_profile': 'Chargement de votre profil...',
    'loading.checking_permissions': 'Vérification des permissions...',
    
    // Footer
    'footer.built_with_love': '© 2025. Fait avec ❤️ en utilisant',
    'footer.caffeine_ai': 'caffeine.ai',
    
    // Language Selector
    'language.select': 'Langue',
    'language.english': 'English',
    'language.spanish': 'Español',
    'language.french': 'Français',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize from localStorage or default to English
    const saved = localStorage.getItem('secretSantaLanguage');
    return (saved === 'en' || saved === 'es' || saved === 'fr') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('secretSantaLanguage', lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const typedKey = key as TranslationKey;
    let translation = translations[language][typedKey] || translations.en[typedKey] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value));
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
